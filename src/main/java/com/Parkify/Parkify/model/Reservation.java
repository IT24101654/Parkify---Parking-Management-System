package com.Parkify.Parkify.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "reservations")
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "driver_id", nullable = false)
    private Long driverId;

    @Column(name = "parking_place_id", nullable = false)
    private Long parkingPlaceId;

    @Column(name = "vehicle_number")
    private String vehicleNumber;

    @Column(name = "start_time")
    private String startTime;

    @Column(name = "end_time")
    private String endTime;

    @Column(name = "status")
    private String status = "CONFIRMED"; // CONFIRMED, CANCELLED

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // Flattened parking info for quick display (denormalized)
    @Column(name = "parking_name")
    private String parkingName;

    @Column(name = "parking_location")
    private String parkingLocation;

    @Column(name = "price_per_hour")
    private Double pricePerHour;
}
