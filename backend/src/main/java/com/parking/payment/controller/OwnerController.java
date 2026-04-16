package com.parking.payment.controller;

import com.parking.payment.entity.Booking;
import com.parking.payment.entity.ParkingSlot;
import com.parking.payment.entity.Payment;
import com.parking.payment.security.UserDetailsImpl;
import com.parking.payment.service.ParkingService;
import com.parking.payment.service.PaymentService;
import com.parking.payment.service.PayoutService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/owner")
@PreAuthorize("hasRole('OWNER')")
public class OwnerController {

    @Autowired
    private ParkingService parkingService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private PayoutService payoutService;

    @GetMapping("/slots")
    public ResponseEntity<List<ParkingSlot>> getMySlots(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(parkingService.getSlotsByOwner(userDetails.getId()));
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<Booking>> getBookingsForMySlots(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(parkingService.getBookingsByOwner(userDetails.getId()));
    }

    @GetMapping("/payments")
    public ResponseEntity<List<Payment>> getPaymentsForMySlots(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(paymentService.getPaymentsByOwner(userDetails.getId()));
    }

    @GetMapping("/payouts")
    public ResponseEntity<List<com.parking.payment.entity.Payout>> getMyPayouts(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(payoutService.getPayoutsForOwner(userDetails.getId()));
    }
}
