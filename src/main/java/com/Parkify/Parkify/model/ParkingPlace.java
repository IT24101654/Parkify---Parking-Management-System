package com.Parkify.Parkify.model;
import org.springframework.data.annotation.Transient;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import lombok.Data;
import java.util.List;

@Document
@Data

@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class ParkingPlace {

    
    private Boolean hasInventory = false;

    
    private Boolean hasServiceCenter = false;

    @Id
    
    private Long id;

    
    private Long ownerId;

    @Transient
    private String ownerEmail;

    
    private String parkingName;

    private int slots;

    private String description;

    private String address;

    private String city;

    private String area;

    
    private String openHours;

    
    private String closeHours;

    
    private Boolean is24Hours = false;

    
    private Boolean weekendAvailable = true;

    
    private Boolean temporaryClosed = false;

    private String status = "ACTIVE"; // ACTIVE, INACTIVE, CLOSED_TEMPORARILY

    private String location;

    private double price; // Hourly price

    
    private Double dailyPrice;

    
    private Double weekendPrice;

    private String type; // Public, Private, VIP, etc.

    
    private Double latitude;

    
    private Double longitude;

    
    private String placeImage;

    @DBRef(lazy = true)
    @JsonIgnore
    private List<ParkingSlot> parkingSlots;
}

