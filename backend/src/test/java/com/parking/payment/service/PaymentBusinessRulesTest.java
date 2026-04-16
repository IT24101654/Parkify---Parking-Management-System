package com.parking.payment.service;

import com.parking.payment.dto.PaymentInitiateRequest;
import com.parking.payment.dto.PaymentWebhookPayload;
import com.parking.payment.entity.Booking;
import com.parking.payment.entity.ParkingSlot;
import com.parking.payment.entity.Payment;
import com.parking.payment.entity.Payout;
import com.parking.payment.entity.RefundRequest;
import com.parking.payment.entity.User;
import com.parking.payment.repository.BookingRepository;
import com.parking.payment.repository.ParkingSlotRepository;
import com.parking.payment.repository.PaymentRepository;
import com.parking.payment.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@SpringBootTest
@Transactional
public class PaymentBusinessRulesTest {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private RefundService refundService;

    @Autowired
    private PayoutService payoutService;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ParkingSlotRepository parkingSlotRepository;

    @MockBean
    private PaymentGatewayService gatewayService;

    @MockBean
    private InvoiceService invoiceService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private User driver;
    private User owner;
    private User admin;
    private ParkingSlot slot;
    private Booking booking;

    @BeforeEach
    public void setup() {
        driver = new User();
        driver.setFullName("Test Driver");
        driver.setEmail("driver@test.com");
        driver.setPasswordHash("pass");
        driver.setRole(com.parking.payment.entity.Role.DRIVER);
        driver = userRepository.save(driver);

        owner = new User();
        owner.setFullName("Test Owner");
        owner.setEmail("owner@test.com");
        owner.setPasswordHash("pass");
        owner.setRole(com.parking.payment.entity.Role.OWNER);
        owner = userRepository.save(owner);

        admin = new User();
        admin.setFullName("Test Admin");
        admin.setEmail("admin@test.com");
        admin.setPasswordHash("pass");
        admin.setRole(com.parking.payment.entity.Role.ADMIN);
        admin = userRepository.save(admin);

        slot = new ParkingSlot();
        slot.setOwner(owner);
        slot.setAddress("123 Test St");
        slot.setLocationName("Test Lot");
        slot.setHourlyRate(new BigDecimal("10.00"));
        slot.setIsActive(true);
        slot = parkingSlotRepository.save(slot);

        booking = new Booking();
        booking.setDriver(driver);
        booking.setSlot(slot);
        booking.setStartTime(LocalDateTime.now().plusDays(1));
        booking.setEndTime(LocalDateTime.now().plusDays(1).plusHours(2));
        booking.setTotalAmount(new BigDecimal("20.00"));
        booking.setStatus(Booking.BookingStatus.PENDING);
        booking = bookingRepository.save(booking);

        when(gatewayService.initiatePaymentIntent(any(), anyString(), anyString()))
                .thenReturn("test_sess_id_123|||http://test.url");
    }

    @Test
    public void testScenario1_SuccessfulPayment() {
        PaymentInitiateRequest req = new PaymentInitiateRequest();
        req.setBookingId(booking.getId());

        paymentService.initiatePayment(driver.getId(), req);

        PaymentWebhookPayload webhook = new PaymentWebhookPayload();
        webhook.setGatewayTransactionId("test_sess_id_123");
        webhook.setStatus("SUCCESS");
        
        paymentService.processWebhook(webhook);

        Payment payment = paymentRepository.findByGatewayTransactionId("test_sess_id_123").get();
        assertEquals(Payment.PaymentStatus.PAID, payment.getStatus(), "Payment should transition to PAID");
        
        Booking updatedBooking = bookingRepository.findById(booking.getId()).get();
        assertEquals(Booking.BookingStatus.ACTIVE, updatedBooking.getStatus(), "Booking should be ACTIVE after payment");
    }

    @Test
    public void testScenario2_FailedPayment() {
        PaymentInitiateRequest req = new PaymentInitiateRequest();
        req.setBookingId(booking.getId());

        paymentService.initiatePayment(driver.getId(), req);

        PaymentWebhookPayload webhook = new PaymentWebhookPayload();
        webhook.setGatewayTransactionId("test_sess_id_123");
        webhook.setStatus("FAILED");
        
        paymentService.processWebhook(webhook);

        Payment payment = paymentRepository.findByGatewayTransactionId("test_sess_id_123").get();
        assertEquals(Payment.PaymentStatus.FAILED, payment.getStatus(), "Payment should correctly mark FAILED status");
    }

    @Test
    public void testScenario3_DuplicatePaymentAttempt() {
        PaymentInitiateRequest req = new PaymentInitiateRequest();
        req.setBookingId(booking.getId());

        // First attempt
        paymentService.initiatePayment(driver.getId(), req);

        // Second attempt - should be blocked idempotently
        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            paymentService.initiatePayment(driver.getId(), req);
        });
        
        assertEquals("A payment is already in progress for this booking.", ex.getMessage(), "System strictly blocks duplicate overlapping initiates");
    }

    @Test
    public void testScenario4_RefundRequestAndApproval() {
        // Initialize and Pay
        PaymentInitiateRequest req = new PaymentInitiateRequest();
        req.setBookingId(booking.getId());
        paymentService.initiatePayment(driver.getId(), req);
        PaymentWebhookPayload webhook = new PaymentWebhookPayload();
        webhook.setGatewayTransactionId("test_sess_id_123");
        webhook.setStatus("SUCCESS");
        paymentService.processWebhook(webhook);
        Payment payment = paymentRepository.findByGatewayTransactionId("test_sess_id_123").get();

        // Submit Refund
        RefundRequest refundReq = refundService.submitRefund(payment.getId(), "Plans changed", driver);
        assertEquals(RefundRequest.RefundStatus.REQUESTED, refundReq.getStatus());
        assertEquals(payment.getAmount().doubleValue(), refundReq.getAmountRefunded().doubleValue(), "Refund bounds are completely guarded to max payment amount");

        // Try double requesting refund
        RuntimeException dupEx = assertThrows(RuntimeException.class, () -> {
            refundService.submitRefund(payment.getId(), "Plans changed again", driver);
        });
        assertEquals("A refund request is already pending for this payment.", dupEx.getMessage());

        // Admin Approval
        refundService.processRefund(refundReq.getId(), true, admin);
        
        Payment refundedPayment = paymentRepository.findById(payment.getId()).get();
        assertEquals(Payment.PaymentStatus.REFUNDED, refundedPayment.getStatus(), "Payment status correctly transitions to REFUNDED");
    }

    @Test
    public void testScenario5_PaymentTimeout() {
        // Simulate a stale transaction
        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setDriver(driver);
        payment.setAmount(new BigDecimal("15.00"));
        payment.setPaymentMethod("STRIPE");
        payment.setStatus(Payment.PaymentStatus.PENDING);
        payment.setIsSettled(false);
        payment = paymentRepository.save(payment);

        jdbcTemplate.update("UPDATE payments SET created_at = ? WHERE id = ?", LocalDateTime.now().minusMinutes(20), payment.getId());

        paymentService.expireStalePayments();

        Payment stalePayment = paymentRepository.findById(payment.getId()).get();
        assertEquals(Payment.PaymentStatus.EXPIRED, stalePayment.getStatus(), "Stale payment cleanly transitions to EXPIRED");

        Booking cancelledBooking = bookingRepository.findById(booking.getId()).get();
        assertEquals(Booking.BookingStatus.CANCELLED, cancelledBooking.getStatus(), "Booking correctly released on expiry");
    }

    @Test
    public void testScenario6_InvalidTransactionReference() {
        PaymentWebhookPayload webhook = new PaymentWebhookPayload();
        webhook.setGatewayTransactionId("fake_missing_txn_123");
        webhook.setStatus("SUCCESS");

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            paymentService.processWebhook(webhook);
        });
        assertEquals("Transaction not found", ex.getMessage(), "System prevents ghost webhooks via secure fetching");
    }

    @Test
    public void testScenario7_OwnerPayoutCalculation() {
        // Setup 3 successful payments for the owner's slot
        for(int i=0; i<3; i++) {
            Booking b = new Booking();
            b.setDriver(driver);
            b.setSlot(slot);
            b.setStartTime(LocalDateTime.now().plusHours(1));
            b.setEndTime(LocalDateTime.now().plusHours(2));
            b.setTotalAmount(new BigDecimal("10.00")); // Each is $10 = $30 total
            b.setStatus(Booking.BookingStatus.ACTIVE);
            b = bookingRepository.save(b);

            Payment p = new Payment();
            p.setBooking(b);
            p.setDriver(driver);
            p.setAmount(new BigDecimal("10.00"));
            p.setPaymentMethod("STRIPE");
            p.setStatus(Payment.PaymentStatus.PAID); // Must be explicitly paid
            p.setIsSettled(false);
            paymentRepository.save(p);
        }

        Payout payout = payoutService.processPayoutForOwner(owner.getId(), admin);

        // Earnings must be strictly enforced:
        // $30 total, 15% platform fee = $4.50, net = $25.50
        assertEquals(30.00, payout.getTotalEarnings().doubleValue(), "Total exact accumulation correct");
        assertEquals(4.50, payout.getPlatformFee().doubleValue(), "15% platform fee rigidly enforced");
        assertEquals(25.50, payout.getNetPayout().doubleValue(), "Formula earnings = total - platform successfully maps");
    }
}
