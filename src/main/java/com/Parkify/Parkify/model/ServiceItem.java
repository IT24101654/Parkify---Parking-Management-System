package com.Parkify.Parkify.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.time.LocalDateTime;

@Document
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})

public class ServiceItem {

    @Id
    
    private Long id;

    
    private String name;

    
    private String category; // e.g., Car Wash, Oil Change, Tire Service

    
    private String description;

    
    private Double price;

    
    private String estimatedTime; // e.g., "30 mins", "2 hours"

    private Boolean active = true;

    /* @CreatedDate */
    
    private LocalDateTime createdAt;

    /* @LastModifiedDate */
    
    private LocalDateTime updatedAt;

    @DBRef(lazy = true)
    
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    @DBRef(lazy = true)
    
    @com.fasterxml.jackson.annotation.JsonIgnore
    private ServiceCenter serviceCenter;
}


