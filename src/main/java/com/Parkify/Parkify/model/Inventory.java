package com.Parkify.Parkify.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Document
@Data
@NoArgsConstructor
@AllArgsConstructor

public class Inventory {
    @Id
    
    private Long id;

    private String itemName;
    private String inventoryType;
    private String category;
    private Double quantity;
    private Double unitPrice;
    private String supplier;
    private LocalDate expiryDate;
    private Double thresholdValue;
    private LocalDate lastRestockDate;

    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime updatedAt;

    @DBRef(lazy = true)
    
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    @DBRef(lazy = true)
    
    @com.fasterxml.jackson.annotation.JsonIgnore
    private ParkingPlace parkingPlace;
}


