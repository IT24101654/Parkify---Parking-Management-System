package com.Parkify.Parkify.controller;

import com.Parkify.Parkify.dto.*;
import com.Parkify.Parkify.service.ServiceAppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/service-appointments")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001",
        "http://localhost:3002", "http://localhost:3003" })
public class ServiceAppointmentController {

    private final ServiceAppointmentService service;

    // ── CREATE ────────────────────────────────────────────────────
    @PostMapping
    public synchronized ResponseEntity<ServiceApiResponse<ServiceAppointmentResponse>> create(
            @Valid @RequestBody ServiceAppointmentRequest req) {
        ServiceAppointmentResponse created = service.createAppointment(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ServiceApiResponse.success("Appointment created successfully", created));
    }

    // ── GET ALL (search + filter + pagination) ────────────────────
    @GetMapping
    public ResponseEntity<ServiceApiResponse<Page<ServiceAppointmentResponse>>> getAll(
            @RequestParam(required = false) String bookingId,
            @RequestParam(required = false) String customerName,
            @RequestParam(required = false) String vehicleId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) Long driverId,
            @RequestParam(required = false) String serviceCenter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<ServiceAppointmentResponse> result = service.searchAppointments(
                bookingId, customerName, vehicleId, status, dateFrom, dateTo, driverId, serviceCenter, page, size);
        return ResponseEntity.ok(ServiceApiResponse.success(result));
    }

    // ── GET ONE ───────────────────────────────────────────────────
    @GetMapping("/{bookingId}")
    public ResponseEntity<ServiceApiResponse<ServiceAppointmentResponse>> getOne(
            @PathVariable String bookingId) {
        return ResponseEntity.ok(ServiceApiResponse.success(service.getByBookingId(bookingId)));
    }

    // ── UPDATE ────────────────────────────────────────────────────
    @PutMapping("/{bookingId}")
    public synchronized ResponseEntity<ServiceApiResponse<ServiceAppointmentResponse>> update(
            @PathVariable String bookingId,
            @Valid @RequestBody ServiceAppointmentUpdateRequest req) {
        return ResponseEntity.ok(
                ServiceApiResponse.success("Appointment updated successfully",
                        service.updateAppointment(bookingId, req)));
    }

    @PatchMapping("/{bookingId}/cancel")
    public ResponseEntity<ServiceApiResponse<ServiceAppointmentResponse>> cancel(
            @PathVariable String bookingId) {
        return ResponseEntity.ok(
                ServiceApiResponse.success("Appointment cancelled",
                        service.cancelAppointment(bookingId)));
    }

    // ── COMPLETE ──────────────────────────────────────────────────
    @PatchMapping("/{bookingId}/complete")
    public ResponseEntity<ServiceApiResponse<ServiceAppointmentResponse>> complete(
            @PathVariable String bookingId) {
        return ResponseEntity.ok(
                ServiceApiResponse.success("Appointment marked as completed",
                        service.completeAppointment(bookingId)));
    }
}
