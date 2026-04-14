package com.Parkify.Parkify.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceAppointmentRequest {

    @NotBlank(message = "Customer name is required")
    @Size(max = 150, message = "Customer name must not exceed 150 characters")
    private String customerName;

    @Size(max = 20, message = "Phone must not exceed 20 characters")
    private String phone;

    @NotBlank(message = "Vehicle ID is required")
    @Size(max = 50, message = "Vehicle ID must not exceed 50 characters")
    private String vehicleId;

    @NotBlank(message = "Vehicle type is required")
    private String vehicleType;

    @NotBlank(message = "Service type is required")
    @Size(max = 100, message = "Service type must not exceed 100 characters")
    private String serviceType;

    @NotBlank(message = "Service center is required")
    @Size(max = 150, message = "Service center name must not exceed 150 characters")
    private String serviceCenter;

    private Long parkingPlaceId;

    private Long driverId;

    @NotNull(message = "Service date is required")
    @FutureOrPresent(message = "Service date cannot be in the past")
    private LocalDate serviceDate;

    @NotBlank(message = "Time slot is required")
    @Pattern(regexp = "^(09:00|10:00|11:00|12:00|14:00|15:00|16:00)$",
            message = "Time slot must be one of: 09:00, 10:00, 11:00, 12:00, 14:00, 15:00, 16:00")
    private String timeSlot;

    private String notes;
}
