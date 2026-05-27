package com.Parkify.Parkify.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;







import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Document
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Otp {

    @Id
    
    private Long id;

    
    private String email;
    private String otp;
    private LocalDateTime expiryTime;
}

