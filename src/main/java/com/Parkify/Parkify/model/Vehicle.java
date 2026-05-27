package com.Parkify.Parkify.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document
@Data
@NoArgsConstructor
@AllArgsConstructor

public class Vehicle {
    @Id
    
    private Long id;

    
    private String vehicleNumber;

    private String brand;
    private String model;
    private String type;
    private String fuelType;

    private String vehicleImage;
    private String revenueLicenseImage;

    @DBRef(lazy = true)
    
    @JsonIgnore
    private User owner;
}

