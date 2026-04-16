package com.parking.payment.controller;

import com.parking.payment.entity.AuditLog;
import com.parking.payment.entity.Payment;
import com.parking.payment.entity.Payout;
import com.parking.payment.entity.RefundRequest;
import com.parking.payment.entity.User;
import com.parking.payment.repository.UserRepository;
import com.parking.payment.service.AuditLogService;
import com.parking.payment.service.PaymentService;
import com.parking.payment.service.PayoutService;
import com.parking.payment.service.RefundService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private RefundService refundService;

    @Autowired
    private PayoutService payoutService;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/payments")
    public ResponseEntity<List<Payment>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @GetMapping("/refunds/pending")
    public ResponseEntity<List<RefundRequest>> getPendingRefunds() {
        return ResponseEntity.ok(refundService.getPendingRefunds());
    }

    @PostMapping("/refunds/{refundId}/process")
    public ResponseEntity<?> processRefund(@PathVariable Long refundId, @RequestBody Map<String, Boolean> payload, Authentication auth) {
        User admin = userRepository.findByEmail(auth.getName()).orElseThrow();
        Boolean approve = payload.get("approve");
        RefundRequest request = refundService.processRefund(refundId, approve, admin);
        return ResponseEntity.ok(request);
    }

    @PostMapping("/payouts/owner/{ownerId}")
    public ResponseEntity<?> processOwnerPayout(@PathVariable Long ownerId, Authentication auth) {
        User admin = userRepository.findByEmail(auth.getName()).orElseThrow();
        try {
            Payout payout = payoutService.processPayoutForOwner(ownerId, admin);
            return ResponseEntity.ok(payout);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/logs")
    public ResponseEntity<List<AuditLog>> getSystemLogs() {
        return ResponseEntity.ok(auditLogService.getRecentLogs());
    }
}
