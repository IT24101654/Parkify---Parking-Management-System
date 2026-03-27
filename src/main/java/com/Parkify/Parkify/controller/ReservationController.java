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

    private Long getAuthenticatedUserId(Authentication authentication) {
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        return user.getId();
    }

    @PostMapping("/book")
    public ResponseEntity<?> bookParking(@RequestBody Map<String, Object> bookingData,
                                          Authentication authentication) {
        try {
            Long driverId = getAuthenticatedUserId(authentication);
            Reservation reservation = reservationService.bookParking(driverId, bookingData);
            return ResponseEntity.ok(reservation);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyReservations(Authentication authentication) {
        try {
            Long driverId = getAuthenticatedUserId(authentication);
            List<Reservation> reservations = reservationService.getMyReservations(driverId);
            return ResponseEntity.ok(reservations);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/cancel/{id}")
    public ResponseEntity<?> cancelReservation(@PathVariable("id") Long id,
                                                Authentication authentication) {
        try {
            Long driverId = getAuthenticatedUserId(authentication);
            Reservation updated = reservationService.cancelReservation(id, driverId);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
