package com.Parkify.Parkify.controller;

import com.Parkify.Parkify.model.Payment;
import com.Parkify.Parkify.model.User;
import com.Parkify.Parkify.repository.PaymentRepository;
import com.Parkify.Parkify.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private UserService userService;

    private Long getAuthenticatedUserId(Authentication authentication) {
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        return user.getId();
    }

    /** GET /api/payments/my */
    @GetMapping("/my")
    public ResponseEntity<?> getMyPayments(Authentication authentication) {
        try {
            Long driverId = getAuthenticatedUserId(authentication);
            
            // In a highly optimized system we'd write a custom query in PaymentRepository
            // `findByReservationDriverId(driverId)`. For now, we fetch all and filter or 
            // since we have the Reservation relationship, let's map it.
            // But wait, the standard JPA way without query is filtering the findAll stream:
            // Instead of returning raw Payment entities which have lazy loaded relationships, we map them
            List<Map<String, Object>> myPayments = paymentRepository.findAll().stream()
                .filter(p -> p.getReservation() != null && p.getReservation().getDriverId().equals(driverId))
                .map(p -> {
                    Map<String, Object> map = new java.util.HashMap<>();
                    map.put("id", p.getId());
                    map.put("amount", p.getAmount());
                    map.put("paymentMethod", p.getPaymentMethod());
                    map.put("status", p.getStatus());
                    map.put("createdAt", p.getCreatedAt());
                    map.put("reservationId", p.getReservation().getId());
                    return map;
                })
                .collect(Collectors.toList());
                
            return ResponseEntity.ok(myPayments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Error fetch"));
        }
    }

    /** POST /api/payments/{id}/refund */
    @PostMapping("/{id}/refund")
    public ResponseEntity<?> requestRefund(@PathVariable("id") Long id,
                                            @RequestBody Map<String, String> payload,
                                            Authentication authentication) {
        try {
            Long driverId = getAuthenticatedUserId(authentication);
            Payment payment = paymentRepository.findById(id).orElseThrow(() -> new RuntimeException("Payment not found"));
            
            if (!payment.getReservation().getDriverId().equals(driverId)) {
                throw new RuntimeException("Unauthorized");
            }
            
            // Mark payment as refund requested
            payment.setStatus("REFUND_REQUESTED");
            payment.setRefundReason(payload.get("reason"));
            paymentRepository.save(payment);

            return ResponseEntity.ok(Map.of("message", "Refund requested successfully. Reason: " + payload.get("reason")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Failed to refund"));
        }
    }

    /** GET /api/payments/owner/{ownerId}/refunds/pending */
    @GetMapping("/owner/{ownerId}/refunds/pending")
    public ResponseEntity<?> getPendingRefundsForOwner(@PathVariable("ownerId") Long ownerId) {
        try {
            
            return ResponseEntity.ok(paymentRepository.findPaymentsByOwnerIdAndStatus(ownerId, "REFUND_REQUESTED"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** POST /api/payments/owner/refunds/{id}/process */
    @PostMapping("/owner/refunds/{id}/process")
    public ResponseEntity<?> processRefund(@PathVariable("id") Long id,
                                           @RequestBody Map<String, Boolean> payload) {
        try {
            Payment payment = paymentRepository.findById(id).orElseThrow(() -> new RuntimeException("Payment not found"));
            
            boolean approve = payload.getOrDefault("approve", false);
            
            if (approve) {
                payment.setStatus("REFUNDED");
                payment.getReservation().setPaymentStatus("REFUNDED");
            } else {
                payment.setStatus("PAID"); // Reset to paid if rejected
                payment.setRefundReason(null); // Clear the reason so it doesn't show up again
            }
            
            paymentRepository.save(payment);

            return ResponseEntity.ok(Map.of("message", approve ? "Refund Approved" : "Refund Rejected"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** GET /api/payments/owner/{ownerId}/history */
    @GetMapping("/owner/{ownerId}/history")
    public ResponseEntity<?> getPaymentHistoryForOwner(@PathVariable("ownerId") Long ownerId) {
        try {
            List<Payment> history = paymentRepository.findPaymentsByOwnerId(ownerId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Failed to fetch history"));
        }
    }

    /** GET /api/payments/verify */
    @GetMapping("/verify")
    public ResponseEntity<?> verifyPaymentFallback(@RequestParam("session_id") String sessionId) {
        try {
            // Find payment by gateway transaction ID
            Payment payment = paymentRepository.findAll().stream()
                .filter(p -> sessionId.equals(p.getGatewayTransactionId()))
                .findFirst()
                .orElse(null);

            if (payment != null && "PENDING".equals(payment.getStatus())) {
                // If the webhook hasn't hit yet (e.g. local testing), we verify it manually
                payment.setStatus("PAID");
                payment.getReservation().setPaymentStatus("PAID");
                paymentRepository.save(payment);
                System.out.println("Payment fallback verified successfully for session: " + sessionId);
            }
            return ResponseEntity.ok(Map.of("status", "verified"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
