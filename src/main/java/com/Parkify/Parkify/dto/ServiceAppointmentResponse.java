package com.Parkify.Parkify.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceAppointmentResponse {
    private Long id;
    private String bookingId;
    private String customerName;
    private String phone;
    private String vehicleId;
    private String vehicleType;
    private String serviceType;
    private String serviceCenter;
    private Long parkingPlaceId;
    private Long driverId;
    private LocalDate serviceDate;
    private String timeSlot;
    private String status;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime cancelledAt;
    private LocalDateTime completedAt;
}
