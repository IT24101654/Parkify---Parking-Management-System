package com.Parkify.Parkify.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document
@Data

public class Reservation {

    @Id
    
    private Long id;

    
    private Long driverId;

    
    private String driverName;

    
    private Long parkingPlaceId;

    
    private Long slotId;

    
    private String slotNumber;

    
    private String vehicleNumber;

    
    private String vehicleType; // Car, Bike, EV

    
    private LocalDate reservationDate;

    
    private String startTime;

    
    private String endTime;

    
    private Double duration; // hours, auto-calculated

    
    private Double totalAmount;

    
    private String paymentStatus = "PENDING"; // PENDING, PAID

    
    private String status = "PENDING"; // PENDING, CONFIRMED, CANCELLED, EXPIRED, COMPLETED

    /* @CreatedDate */
    
    private LocalDateTime createdAt;

    // Flattened parking info for quick display (denormalized)
    
    private String parkingName;

    
    private String parkingLocation;

    
    private Double pricePerHour;
}


