package com.Parkify.Parkify.service;

import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import com.Parkify.Parkify.repository.PaymentRepository;
import com.Parkify.Parkify.repository.ReservationRepository;
import com.Parkify.Parkify.model.Payment;
import com.Parkify.Parkify.model.Reservation;
import com.Parkify.Parkify.dto.PaymentWebhookPayload;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.util.Optional;

@Service
public class PaymentGatewayService {

    private static final Logger logger = LoggerFactory.getLogger(PaymentGatewayService.class);

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @Value("${stripe.redirect.url}")
    private String clientBaseUrl;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private SmsNotificationService smsNotificationService;

    @PostConstruct
    public void init() {
        // Only initialize if it's a real key, otherwise we just mock it for now if needed.
        if (stripeApiKey != null && !stripeApiKey.contains("replace")) {
            Stripe.apiKey = stripeApiKey;
            logger.info("Stripe SDK Initialized with base URL: {}", clientBaseUrl);
        } else {
            logger.warn("Stripe API key is a placeholder. Payments will be mocked.");
        }
    }

    public String createStripeSession(Reservation reservation, String currency) {
        BigDecimal amount = java.math.BigDecimal.valueOf(reservation.getTotalAmount());
        String referenceId = String.valueOf(reservation.getId());
        String checkoutUrl;
        String sessionId;

        if (stripeApiKey == null || stripeApiKey.contains("replace")) {
            sessionId = "cs_test_mock_" + System.currentTimeMillis();
            checkoutUrl = "https://checkout.stripe.com/pay/cs_test_mock_" + referenceId;
        } else {
            try {
                Long calculatedAmount = amount.multiply(new BigDecimal(100)).longValue();
                Long unitAmount = Math.max(calculatedAmount, 20000L); // Stripe requires a minimum charge equivalent to ~0.50 USD (approx 150-200 LKR). enforce 200 LKR minimum.

                SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl(clientBaseUrl + "/driver-dashboard?session_id={CHECKOUT_SESSION_ID}&success=true")
                    .setCancelUrl(clientBaseUrl + "/driver-dashboard?canceled=true")
                    .setClientReferenceId(referenceId)
                    .addLineItem(
                        SessionCreateParams.LineItem.builder()
                            .setQuantity(1L)
                            .setPriceData(
                                SessionCreateParams.LineItem.PriceData.builder()
                                    .setCurrency(currency.toLowerCase())
                                    .setUnitAmount(unitAmount)
                                    .setProductData(
                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                            .setName("Parking Payment - Reservation #" + referenceId)
                                            .build()
                                    )
                                    .build()
                            )
                            .build()
                    )
                    .build();

                Session session = Session.create(params);
                sessionId = session.getId();
                checkoutUrl = session.getUrl();
            } catch (Exception e) {
                logger.error("Failed to create Stripe Session", e);
                throw new RuntimeException("Stripe Service Unavailable: " + e.getMessage());
            }
        }

        // Create or Update Pending Payment Entity to avoid OneToOne Duplicate Key Constraints
        Payment payment = paymentRepository.findByReservationId(reservation.getId()).orElse(new Payment());
        payment.setReservation(reservation);
        payment.setAmount(reservation.getTotalAmount());
        payment.setPaymentMethod("STRIPE");
        payment.setGatewayTransactionId(sessionId);
        payment.setStatus("PENDING");
        paymentRepository.save(payment);

        return checkoutUrl;
    }

    public void processWebhook(PaymentWebhookPayload payload) {
        Optional<Payment> paymentOpt = paymentRepository.findByGatewayTransactionId(payload.getGatewayTransactionId());
        
        if (paymentOpt.isPresent()) {
            Payment payment = paymentOpt.get();
            Reservation reservation = payment.getReservation();

            if ("SUCCESS".equals(payload.getStatus())) {
                logger.info("Marking payment as PAID for Gateway ID: {}", payload.getGatewayTransactionId());
                payment.setStatus("PAID");
                reservation.setPaymentStatus("PAID");
                reservation.setStatus("CONFIRMED"); // Auto confirm reservation upon successful payment
                
                // Send SMS Confirmation via Twilio
                smsNotificationService.sendPaymentConfirmation(
                        String.valueOf(reservation.getId()), 
                        String.valueOf(payment.getAmount()), 
                        payment.getPaymentMethod(), 
                        reservation.getDriverName(), 
                        null // Fallback inside SmsService
                );
            } else if ("FAILED".equals(payload.getStatus())) {
                logger.warn("Marking payment as FAILED for Gateway ID: {}", payload.getGatewayTransactionId());
                payment.setStatus("FAILED");
                reservation.setPaymentStatus("PENDING"); // Reverted to pending so user can retry
            }

            paymentRepository.save(payment);
            reservationRepository.save(reservation);
        } else {
            logger.warn("Received webhook for unknown transaction ID: {}", payload.getGatewayTransactionId());
        }
    }
}
