package com.Parkify.Parkify.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
@lombok.ToString(exclude = "user")
@lombok.EqualsAndHashCode(exclude = "user")

public class ServiceCenter {

    @Id
    
    private Long id;

    
    private String name;

    
    private String description;

    
    private String contactNumber;

    
    private String workingHours;

    
    private String servicesOffered;

    
    private String address;

    
    private String type; // e.g., General, Specialized, etc.

    
    private String notes;

    
    private String servicesSummary;

    
    private Boolean active = true;

    /* @CreatedDate */
    
    private LocalDateTime createdAt;

    /* @LastModifiedDate */
    
    private LocalDateTime updatedAt;

    @DBRef(lazy = true)
    
    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY)
    private User user;
}


