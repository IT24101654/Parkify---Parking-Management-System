package com.Parkify.Parkify.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceAppointmentUpdateRequest {

    @Size(max = 100, message = "Service type must not exceed 100 characters")
    private String serviceType;

    @FutureOrPresent(message = "Service date cannot be in the past")
    private LocalDate serviceDate;

    @Pattern(regexp = "^(09:00|10:00|11:00|12:00|14:00|15:00|16:00)$",
            message = "Time slot must be one of: 09:00, 10:00, 11:00, 12:00, 14:00, 15:00, 16:00")
    private String timeSlot;

    private String notes;
}
