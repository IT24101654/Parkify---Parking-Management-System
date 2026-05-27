package com.Parkify.Parkify.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import lombok.*;



import java.time.LocalDate;
import java.time.LocalDateTime;

@Document

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceAppointment {

    @Id
    
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

    @Builder.Default
    
    private String status = "BOOKED";

    
    private String notes;

    /* @CreatedDate */
    
    private LocalDateTime createdAt;

    /* @LastModifiedDate */
    
    private LocalDateTime updatedAt;

    
    private LocalDateTime cancelledAt;

    
    private LocalDateTime completedAt;
}


