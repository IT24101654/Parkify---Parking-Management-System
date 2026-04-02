package com.Parkify.Parkify.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Data
@Table(name = "parking_places")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ParkingPlace {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "owner_id")
    private Long ownerId;

    @Column(name = "parking_name")
    private String parkingName;

    private int slots;

    private String description;

    private String address;

    private String city;

    private String area;

    @Column(name = "open_hours")
    private String openHours;

    @Column(name = "close_hours")
    private String closeHours;

    @Column(name = "is_24_hours")
    private Boolean is24Hours = false;

    @Column(name = "weekend_available")
    private Boolean weekendAvailable = true;

    @Column(name = "temporary_closed")
    private Boolean temporaryClosed = false;

    private String status = "ACTIVE"; // ACTIVE, INACTIVE, CLOSED_TEMPORARILY

    private String location;

    private double price; // Hourly price

    @Column(name = "daily_price")
    private Double dailyPrice;

    @Column(name = "weekend_price")
    private Double weekendPrice;

    private String type; // Public, Private, VIP, etc.

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "place_image")
    private String placeImage;

    @OneToMany(mappedBy = "parkingPlace", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<ParkingSlot> parkingSlots;
}