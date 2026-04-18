package com.Parkify.Parkify.controller;

import com.Parkify.Parkify.model.Reservation;
import com.Parkify.Parkify.model.User;
import com.Parkify.Parkify.service.ReservationService;
import com.Parkify.Parkify.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reservations")
@CrossOrigin(origins = "*")
public class ReservationController {

    @Autowired
    private ReservationService reservationService;

    @Autowired
    private UserService userService;

    @Autowired
    private com.Parkify.Parkify.service.PaymentGatewayService paymentGatewayService;

    @Autowired
    private com.Parkify.Parkify.service.SmsNotificationService smsNotificationService;

    @Autowired
    private com.Parkify.Parkify.repository.PaymentRepository paymentRepository;

    private Long getAuthenticatedUserId(Authentication authentication) {
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        return user.getId();
    }

    /** POST /api/reservations/book */
    @PostMapping("/book")
    public ResponseEntity<?> bookParking(@RequestBody Map<String, Object> bookingData,
                                          Authentication authentication) {
        try {
            Long driverId = getAuthenticatedUserId(authentication);
            Reservation reservation = reservationService.bookParking(driverId, bookingData);
            return ResponseEntity.ok(reservation);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Server error"));
        }
    }

    /** GET /api/reservations/my */
    @GetMapping("/my")
    public ResponseEntity<?> getMyReservations(Authentication authentication) {
        try {
            Long driverId = getAuthenticatedUserId(authentication);
            List<Reservation> reservations = reservationService.getMyReservations(driverId);
            return ResponseEntity.ok(reservations);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Server error"));
        }
    }

    /** GET /api/reservations/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<?> getReservationById(@PathVariable("id") Long id,
                                                  Authentication authentication) {
        try {
            Long driverId = getAuthenticatedUserId(authentication);
            Reservation reservation = reservationService.getReservationById(id, driverId);
            return ResponseEntity.ok(reservation);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Server error"));
        }
    }

    /** POST /api/reservations/{id}/pay */
    @PostMapping("/{id}/pay")
    public ResponseEntity<?> initiatePayment(@PathVariable("id") Long id,
                                              @RequestBody Map<String, String> payload,
                                              Authentication authentication) {
        try {
            Long driverId = getAuthenticatedUserId(authentication);
            Reservation reservation = reservationService.getReservationById(id, driverId);
            
            String method = payload.getOrDefault("paymentMethod", "STRIPE");
            
            if ("CASH".equalsIgnoreCase(method)) {
                // Set status on Reservation
                reservation.setPaymentStatus("CASH_PENDING");
                reservationService.updateReservation(reservation.getId(), driverId, Map.of("paymentStatus", "CASH_PENDING"));

                // Create Pending Payment Record
                com.Parkify.Parkify.model.Payment payment = new com.Parkify.Parkify.model.Payment();
                payment.setReservation(reservation);
                payment.setAmount(reservation.getTotalAmount());
                payment.setPaymentMethod("CASH");
                payment.setStatus("PENDING");
                paymentRepository.save(payment);

                // Fire SMS
                smsNotificationService.sendCashPaymentPending(
                        String.valueOf(reservation.getId()), 
                        String.valueOf(reservation.getTotalAmount()), 
                        reservation.getDriverName(), 
                        null
                );

                return ResponseEntity.ok(Map.of("message", "Cash payment selected and SMS queued"));
            } else {
                Double total = reservation.getTotalAmount();
                if (total == null || total <= 0) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Invalid reservation amount"));
                }
                
                String checkoutUrl = paymentGatewayService.createStripeSession(reservation, "lkr");
                
                return ResponseEntity.ok(Map.of("checkoutUrl", checkoutUrl));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Payment initiation failed"));
        }
    }

    /** PUT /api/reservations/cancel/{id} */
    @PutMapping("/cancel/{id}")
    public ResponseEntity<?> cancelReservation(@PathVariable("id") Long id,
                                                Authentication authentication) {
        try {
            Long driverId = getAuthenticatedUserId(authentication);
            Reservation updated = reservationService.cancelReservation(id, driverId);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Server error"));
        }
    }

    /** PUT /api/reservations/update/{id} */
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateReservation(@PathVariable("id") Long id,
                                                @RequestBody Map<String, Object> data,
                                                Authentication authentication) {
        try {
            Long driverId = getAuthenticatedUserId(authentication);
            Reservation updated = reservationService.updateReservation(id, driverId, data);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Server error"));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllReservations() {
        try {
            List<Reservation> all = reservationService.getAllReservations();
            return ResponseEntity.ok(all);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Server error"));
        }
    }

    /** GET /api/reservations/owner */
    @GetMapping("/owner")
    public ResponseEntity<?> getOwnerReservations(Authentication authentication) {
        try {
            Long ownerId = getAuthenticatedUserId(authentication);
            List<Reservation> reservations = reservationService.getReservationsForOwner(ownerId);
            return ResponseEntity.ok(reservations);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Server error"));
        }
    }

    /** GET /api/reservations/owner/{ownerId} */
    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<?> getOwnerReservationsById(@PathVariable("ownerId") Long ownerId) {
        try {
            List<Reservation> reservations = reservationService.getReservationsForOwner(ownerId);
            return ResponseEntity.ok(reservations);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Server error"));
        }
    }

    /** PATCH /api/reservations/{id}/confirm */
    @PatchMapping("/{id}/confirm")
    public ResponseEntity<?> confirmReservation(@PathVariable("id") Long id,
                                               Authentication authentication) {
        try {
            Long ownerId = getAuthenticatedUserId(authentication);
            Reservation updated = reservationService.confirmReservation(id, ownerId);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Server error"));
        }
    }

    /** PATCH /api/reservations/{id}/cancel-by-owner */
    @PatchMapping("/{id}/cancel-by-owner")
    public ResponseEntity<?> cancelReservationByOwner(@PathVariable("id") Long id,
                                                     Authentication authentication) {
        try {
            Long ownerId = getAuthenticatedUserId(authentication);
            Reservation updated = reservationService.cancelReservationByOwner(id, ownerId);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Server error"));
        }
    }
}
