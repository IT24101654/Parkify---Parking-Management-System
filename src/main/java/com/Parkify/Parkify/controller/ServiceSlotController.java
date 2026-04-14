package com.Parkify.Parkify.controller;

import com.Parkify.Parkify.dto.ServiceApiResponse;
import com.Parkify.Parkify.service.ServiceAppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/service-slots")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001",
        "http://localhost:3002", "http://localhost:3003" })
public class ServiceSlotController {

    private final ServiceAppointmentService service;

    @GetMapping
    public ResponseEntity<ServiceApiResponse<List<ServiceAppointmentService.SlotInfo>>> getSlots(
            @RequestParam String center,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ServiceApiResponse.success(service.getAvailableSlots(center, date)));
    }
}
