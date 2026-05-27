package com.Parkify.Parkify.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import lombok.Data;

@Document
@Data

public class ParkingSlot {

    @Id
    
    private Long id;

    @DBRef(lazy = true)
    
    @JsonIgnore
    private ParkingPlace parkingPlace;

    
    private String slotName;

    
    private String slotType; // Car, Bike, Van, EV

    
    private String slotStatus; // Available, Unavailable, Under Maintenance

    private String floor;

    private String zone;

    private String section;

    private String notes;
}


