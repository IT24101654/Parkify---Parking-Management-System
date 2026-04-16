package com.parking.payment.controller;

import com.parking.payment.dto.BookingRequest;
import com.parking.payment.dto.PaymentInitiateRequest;
import com.parking.payment.entity.Booking;
import com.parking.payment.entity.Payment;
import com.parking.payment.security.UserDetailsImpl;
import com.parking.payment.service.ParkingService;
import com.parking.payment.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/driver")
@PreAuthorize("hasRole('DRIVER')")
public class DriverController {

    @Autowired
    private ParkingService parkingService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private com.parking.payment.service.InvoiceService invoiceService;

    @Autowired
    private com.parking.payment.service.RefundService refundService;

    @Autowired
    private com.parking.payment.repository.UserRepository userRepository;

    @GetMapping("/slots")
    public ResponseEntity<List<?>> getAllAvailableSlots() {
        return ResponseEntity.ok(parkingService.getAllSlots());
    }

    @PostMapping("/booking")
    public ResponseEntity<Booking> createBooking(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody BookingRequest request) {
        return ResponseEntity.ok(parkingService.createBooking(userDetails.getId(), request));
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<Booking>> getMyBookings(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(parkingService.getBookingsByDriver(userDetails.getId()));
    }

    @PostMapping("/payment/initiate")
    public ResponseEntity<com.parking.payment.dto.PaymentInitiateResponse> initiatePayment(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody PaymentInitiateRequest request) {
        return ResponseEntity.ok(paymentService.initiatePayment(userDetails.getId(), request));
    }

    @GetMapping("/payments")
    public ResponseEntity<List<Payment>> getMyPayments(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(paymentService.getPaymentsByDriver(userDetails.getId()));
    }

    @GetMapping("/payment/{paymentId}/invoice")
    public ResponseEntity<com.parking.payment.entity.Invoice> getInvoice(@PathVariable Long paymentId) {
        return ResponseEntity.ok(invoiceService.getInvoiceByPayment(paymentId));
    }

    @PostMapping("/payment/{paymentId}/refund")
    public ResponseEntity<com.parking.payment.entity.RefundRequest> requestRefund(
            @PathVariable Long paymentId,
            @RequestBody java.util.Map<String, String> payload,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        com.parking.payment.entity.User driver = userRepository.findById(userDetails.getId()).orElseThrow();
        return ResponseEntity.ok(refundService.submitRefund(paymentId, payload.get("reason"), driver));
    }
}
