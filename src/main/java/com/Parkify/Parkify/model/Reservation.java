package com.Parkify.Parkify.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDate;
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

    @Column(name = "driver_name")
    private String driverName;

    @Column(name = "parking_place_id", nullable = false)
    private Long parkingPlaceId;

    @Column(name = "slot_id")
    private Long slotId;

    @Column(name = "slot_number")
    private String slotNumber;

    @Column(name = "vehicle_number")
    private String vehicleNumber;

    @Column(name = "vehicle_type")
    private String vehicleType; // Car, Bike, EV

    @Column(name = "reservation_date")
    private LocalDate reservationDate;

    @Column(name = "start_time")
    private String startTime;

    @Column(name = "end_time")
    private String endTime;

    @Column(name = "duration")
    private Double duration; // hours, auto-calculated

    @Column(name = "total_amount")
    private Double totalAmount;

    @Column(name = "payment_status")
    private String paymentStatus = "PENDING"; // PENDING, PAID

    @Column(name = "status")
    private String status = "PENDING"; // PENDING, CONFIRMED, CANCELLED, EXPIRED, COMPLETED

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Flattened parking info for quick display (denormalized)
    @Column(name = "parking_name")
    private String parkingName;

    @Column(name = "parking_location")
    private String parkingLocation;

    @Column(name = "price_per_hour")
    private Double pricePerHour;
}
