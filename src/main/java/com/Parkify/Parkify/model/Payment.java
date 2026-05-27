package com.Parkify.Parkify.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import lombok.Data;


import java.time.LocalDateTime;

@Document
@Data

public class Payment {

    @Id
    
    private Long id;

    @DBRef(lazy = true)
    
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Reservation reservation;

    
    private Double amount;

    
    private String paymentMethod; // STRIPE, CASH

    
    private String gatewayTransactionId; // The Checkout Session ID

    
    private String status; // PENDING, PAID, FAILED, REFUND_REQUESTED, REFUNDED

    
    private String refundReason;

    /* @CreatedDate */
    
    private LocalDateTime createdAt;
}


