package com.Parkify.Parkify.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "parking_places")
public class ParkingPlace {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "parking_name")
    private String parkingName;

    private int slots;

    private String location;

    private double price;

    private String status = "AVAILABLE"; // Default අගය

    private String type;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "place_image")
    private String placeImage;
}