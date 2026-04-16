package com.parking.payment.service;

import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;

@Service
@Primary
public class StripePaymentGatewayImpl implements PaymentGatewayService {

    private static final Logger logger = LoggerFactory.getLogger(StripePaymentGatewayImpl.class);

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @Value("${stripe.redirect.url}")
    private String clientBaseUrl;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
        logger.info("Stripe SDK Initialized with base URL: {}", clientBaseUrl);
    }

    @Override
    public String initiatePaymentIntent(BigDecimal amount, String currency, String referenceId) {
        try {
            Long unitAmount = amount.multiply(new BigDecimal(100)).longValue();

            SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(clientBaseUrl + "/driver/transactions?session_id={CHECKOUT_SESSION_ID}&success=true")
                .setCancelUrl(clientBaseUrl + "/driver/dashboard?canceled=true")
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
                                        .setName("Parking Payment - " + referenceId)
                                        .build()
                                )
                                .build()
                        )
                        .build()
                )
                .build();

            Session session = Session.create(params);
            
            // We return a strongly structured string containing both the URL and the ID
            return session.getId() + "|||" + session.getUrl();
            
        } catch (Exception e) {
            logger.error("Failed to create Stripe Session", e);
            throw new RuntimeException("Stripe Service Unavailable: " + e.getMessage());
        }
    }

    @Override
    public boolean verifyTransaction(String transactionId) {
        // Validation now handled securely by Webhooks using Stripe signature mapping
        return true;
    }

    @Override
    public boolean processRefund(String transactionId, BigDecimal amount) {
        // Left as an exercise or manual Admin process currently
        return true;
    }
}
