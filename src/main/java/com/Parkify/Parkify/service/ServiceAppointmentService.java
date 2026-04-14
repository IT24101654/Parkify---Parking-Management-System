package com.Parkify.Parkify.service;

import com.Parkify.Parkify.dto.*;
import com.Parkify.Parkify.model.ServiceAppointment;
import com.Parkify.Parkify.repository.ServiceAppointmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ServiceAppointmentService {

    private static final List<String> ALL_SLOTS =
            Arrays.asList("09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00");

    private final ServiceAppointmentRepository repository;

    // ── CREATE ────────────────────────────────────────────────────
    @Transactional
    public ServiceAppointmentResponse createAppointment(ServiceAppointmentRequest req) {
        if (repository.existsByServiceCenterAndServiceDateAndTimeSlotAndStatus(
                req.getServiceCenter(), req.getServiceDate(), req.getTimeSlot(), "BOOKED")) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "The selected time slot is already booked for " + req.getServiceCenter()
                            + " on " + req.getServiceDate());
        }

        ServiceAppointment appt = ServiceAppointment.builder()
                .bookingId(generateBookingId())
                .customerName(req.getCustomerName())
                .phone(req.getPhone())
                .vehicleId(req.getVehicleId())
                .vehicleType(req.getVehicleType())
                .serviceType(req.getServiceType())
                .serviceCenter(req.getServiceCenter())
                .parkingPlaceId(req.getParkingPlaceId())
                .driverId(req.getDriverId())
                .serviceDate(req.getServiceDate())
                .timeSlot(req.getTimeSlot())
                .status("BOOKED")
                .notes(req.getNotes())
                .build();

        ServiceAppointment saved = repository.save(appt);
        log.info("Created appointment {}", saved.getBookingId());
        return toResponse(saved);
    }

    // ── READ – all with pagination + filters ─────────────────────
    @Transactional(readOnly = true)
    public Page<ServiceAppointmentResponse> searchAppointments(
            String bookingId, String customerName, String vehicleId,
            String status, LocalDate dateFrom, LocalDate dateTo,
            Long driverId, String serviceCenter, int page, int size) {

        Pageable pageable = PageRequest.of(page, size);
        return repository.searchAppointments(
                nullIfBlank(bookingId), nullIfBlank(customerName),
                nullIfBlank(vehicleId), nullIfBlank(status),
                dateFrom, dateTo, driverId, nullIfBlank(serviceCenter), pageable)
                .map(this::toResponse);
    }

    // ── READ – by bookingId ───────────────────────────────────────
    @Transactional(readOnly = true)
    public ServiceAppointmentResponse getByBookingId(String bookingId) {
        return toResponse(findOrThrow(bookingId));
    }

    // ── UPDATE ────────────────────────────────────────────────────
    @Transactional
    public ServiceAppointmentResponse updateAppointment(String bookingId, ServiceAppointmentUpdateRequest req) {
        ServiceAppointment appt = findOrThrow(bookingId);

        if (!"BOOKED".equals(appt.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only BOOKED appointments can be updated. Current status: " + appt.getStatus());
        }

        LocalDate newDate = req.getServiceDate() != null ? req.getServiceDate() : appt.getServiceDate();
        String newSlot = req.getTimeSlot() != null ? req.getTimeSlot() : appt.getTimeSlot();

        boolean changed = !newDate.equals(appt.getServiceDate()) || !newSlot.equals(appt.getTimeSlot());
        if (changed &&
                repository.existsByServiceCenterAndServiceDateAndTimeSlotAndStatusAndBookingIdNot(
                        appt.getServiceCenter(), newDate, newSlot, "BOOKED", bookingId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "The requested slot " + newSlot + " on " + newDate + " is already booked.");
        }

        if (req.getServiceType() != null) appt.setServiceType(req.getServiceType());
        appt.setServiceDate(newDate);
        appt.setTimeSlot(newSlot);
        if (req.getNotes() != null) appt.setNotes(req.getNotes());

        return toResponse(repository.save(appt));
    }

    // ── CANCEL ────────────────────────────────────────────────────
    @Transactional
    public ServiceAppointmentResponse cancelAppointment(String bookingId) {
        ServiceAppointment appt = findOrThrow(bookingId);
        if (!"BOOKED".equals(appt.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only BOOKED appointments can be cancelled. Current status: " + appt.getStatus());
        }
        appt.setStatus("CANCELLED");
        appt.setCancelledAt(LocalDateTime.now());
        log.info("Cancelled appointment {}", bookingId);
        return toResponse(repository.save(appt));
    }

    // ── COMPLETE ──────────────────────────────────────────────────
    @Transactional
    public ServiceAppointmentResponse completeAppointment(String bookingId) {
        ServiceAppointment appt = findOrThrow(bookingId);
        if (!"BOOKED".equals(appt.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only BOOKED appointments can be completed. Current status: " + appt.getStatus());
        }
        appt.setStatus("COMPLETED");
        appt.setCompletedAt(LocalDateTime.now());
        log.info("Completed appointment {}", bookingId);
        return toResponse(repository.save(appt));
    }

    // ── AVAILABLE SLOTS ───────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<SlotInfo> getAvailableSlots(String center, LocalDate date) {
        return ALL_SLOTS.stream().map(slot -> {
            boolean booked = repository.existsByServiceCenterAndServiceDateAndTimeSlotAndStatus(
                    center, date, slot, "BOOKED");
            return new SlotInfo(slot, !booked);
        }).toList();
    }

    // ── Helpers ───────────────────────────────────────────────────
    private ServiceAppointment findOrThrow(String bookingId) {
        return repository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Appointment not found: " + bookingId));
    }

    private synchronized String generateBookingId() {
        Long maxId = repository.findMaxId();
        long next = (maxId == null ? 0L : maxId) + 1;
        return String.format("SCB-%04d", next);
    }

    private ServiceAppointmentResponse toResponse(ServiceAppointment a) {
        return ServiceAppointmentResponse.builder()
                .id(a.getId())
                .bookingId(a.getBookingId())
                .customerName(a.getCustomerName())
                .phone(a.getPhone())
                .vehicleId(a.getVehicleId())
                .vehicleType(a.getVehicleType())
                .serviceType(a.getServiceType())
                .serviceCenter(a.getServiceCenter())
                .parkingPlaceId(a.getParkingPlaceId())
                .driverId(a.getDriverId())
                .serviceDate(a.getServiceDate())
                .timeSlot(a.getTimeSlot())
                .status(a.getStatus())
                .notes(a.getNotes())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .cancelledAt(a.getCancelledAt())
                .completedAt(a.getCompletedAt())
                .build();
    }

    private String nullIfBlank(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }

    public record SlotInfo(String slot, boolean available) {}
}
