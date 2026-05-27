package com.Parkify.Parkify.model;

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

public class Notification {

    @Id
    
    private Long id;

    
    private String message;

    
    private String type; 

    
    private boolean isRead = false;

    @DBRef(lazy = true)
    
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User admin;

    
    private LocalDateTime createdAt;
    
    
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}


