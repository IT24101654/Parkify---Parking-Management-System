package com.parking.payment.service;

import com.parking.payment.dto.PaymentInitiateRequest;
import com.parking.payment.dto.PaymentWebhookPayload;
import com.parking.payment.entity.Booking;
import com.parking.payment.entity.GatewayLog;
import com.parking.payment.entity.Payment;
import com.parking.payment.repository.BookingRepository;
import com.parking.payment.repository.GatewayLogRepository;
import com.parking.payment.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.scheduling.annotation.Scheduled;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class PaymentService {

    private static final Logger logger = LoggerFactory.getLogger(PaymentService.class);

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PaymentGatewayService gatewayService;

    @Autowired
    private GatewayLogRepository gatewayLogRepository;

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private SmsNotificationService smsNotificationService;

    @Transactional
    public com.parking.payment.dto.PaymentInitiateResponse initiatePayment(Long driverId, PaymentInitiateRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getDriver().getId().equals(driverId)) {
            throw new RuntimeException("You do not own this booking");
        }

        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new RuntimeException("Booking is already processed");
        }
        
        Optional<Payment> existingPaymentOpt = paymentRepository.findByBookingId(booking.getId());
        Payment payment;
        
        if (existingPaymentOpt.isPresent()) {
            payment = existingPaymentOpt.get();
            if (payment.getStatus() == Payment.PaymentStatus.PAID || payment.getStatus() == Payment.PaymentStatus.REFUNDED) {
                throw new RuntimeException("This booking has already been paid successfully.");
            }
            if (payment.getStatus() == Payment.PaymentStatus.PENDING) {
                throw new RuntimeException("A payment is already in progress for this booking.");
            }
            // If FAILED or EXPIRED, we allow a retry on the exact same primary record
            payment.setPaymentMethod("STRIPE");
            payment.setStatus(Payment.PaymentStatus.PENDING);
            payment.setCreatedAt(LocalDateTime.now());
        } else {
            payment = new Payment();
            payment.setBooking(booking);
            payment.setDriver(booking.getDriver());
            payment.setAmount(booking.getTotalAmount());
            payment.setPaymentMethod("STRIPE");
            payment.setStatus(Payment.PaymentStatus.PENDING);
            payment.setIsSettled(false);
        }

        payment = paymentRepository.save(payment);

        // Handle CASH payment method
        if ("CASH".equalsIgnoreCase(request.getPaymentMethod())) {
            payment.setPaymentMethod("CASH");
            payment.setGatewayTransactionId("CASH_" + booking.getId() + "_" + System.currentTimeMillis());
            payment.setStatus(Payment.PaymentStatus.PENDING);
            paymentRepository.save(payment);
            auditLogService.logAction("CASH_PAYMENT_PENDING", "Driver " + payment.getDriver().getEmail() + " chose cash for booking " + booking.getId(), payment.getDriver());
            // Notify the driver via SMS
            smsNotificationService.sendCashPaymentPending(
                String.valueOf(booking.getId()),
                payment.getAmount().toPlainString(),
                payment.getDriver().getFullName(),
                payment.getDriver().getPhoneNumber()
            );
            return new com.parking.payment.dto.PaymentInitiateResponse(null, payment.getId());
        }

        // Handle STRIPE payment method
        String stripeResponse = gatewayService.initiatePaymentIntent(
                payment.getAmount(), 
                "LKR", 
                "BKG_" + booking.getId()
        );

        String[] parts = stripeResponse.split("\\|\\|\\|");
        String stripeSessionId = parts[0];
        String stripeUrl = parts[1];

        payment.setGatewayTransactionId(stripeSessionId);
        
        auditLogService.logAction("PAYMENT_INITIATED", "Driver " + payment.getDriver().getEmail() + " initiated Stripe payment for booking " + booking.getId(), payment.getDriver());
        
        paymentRepository.save(payment);

        return new com.parking.payment.dto.PaymentInitiateResponse(stripeUrl, payment.getId());
    }

    @Transactional
    public void processWebhook(PaymentWebhookPayload payload) {
        // Idempotency check
        Optional<GatewayLog> existingLog = gatewayLogRepository.findByTransactionId(payload.getGatewayTransactionId());
        if (existingLog.isPresent()) {
            return; // Duplicate webhook received, safely ignore
        }

        GatewayLog log = new GatewayLog();
        log.setTransactionId(payload.getGatewayTransactionId());
        log.setRawPayload(payload.toString());
        log.setGatewayStatus(payload.getStatus());
        gatewayLogRepository.save(log);

        Payment payment = paymentRepository.findByGatewayTransactionId(payload.getGatewayTransactionId())
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (payment.getStatus() == Payment.PaymentStatus.PAID || payment.getStatus() == Payment.PaymentStatus.REFUNDED) {
            logger.warn("Strict Transition Rule: Cannot shift state from {} to {}", payment.getStatus(), payload.getStatus());
            return;
        }

        if ("SUCCESS".equalsIgnoreCase(payload.getStatus())) {
            payment.setStatus(Payment.PaymentStatus.PAID);
            
            Booking booking = payment.getBooking();
            booking.setStatus(Booking.BookingStatus.ACTIVE);
            bookingRepository.save(booking);

            invoiceService.generateInvoice(payment);
            auditLogService.logAction("PAYMENT_SUCCESS", "Payment verified for transaction " + log.getTransactionId(), payment.getDriver());
            // Send SMS confirmation to the driver
            smsNotificationService.sendPaymentConfirmation(
                String.valueOf(booking.getId()),
                payment.getAmount().toPlainString(),
                payment.getPaymentMethod(),
                payment.getDriver().getFullName(),
                payment.getDriver().getPhoneNumber()
            );
        } else {
            payment.setStatus(Payment.PaymentStatus.FAILED);
            auditLogService.logAction("PAYMENT_FAILED", "Payment failed for transaction " + log.getTransactionId(), payment.getDriver());
        }

        paymentRepository.save(payment);
    }

    public List<Payment> getPaymentsByDriver(Long driverId) {
        return paymentRepository.findByDriverIdOrderByCreatedAtDesc(driverId);
    }

    public List<Payment> getPaymentsByOwner(Long ownerId) {
        return paymentRepository.findByBookingSlotOwnerIdOrderByCreatedAtDesc(ownerId);
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void expireStalePayments() {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(15);
        List<Payment> stalePayments = paymentRepository.findByStatusAndCreatedAtBefore(Payment.PaymentStatus.PENDING, threshold);
        
        for (Payment p : stalePayments) {
            p.setStatus(Payment.PaymentStatus.EXPIRED);
            paymentRepository.save(p);
            
            Booking b = p.getBooking();
            if (b.getStatus() == Booking.BookingStatus.PENDING) {
                b.setStatus(Booking.BookingStatus.CANCELLED);
                bookingRepository.save(b);
            }
            
            // Assuming system logger exists, log it. Wait, auditLog needs a User, system can be null.
        }
    }
}
