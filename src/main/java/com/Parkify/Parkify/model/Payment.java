package com.Parkify.Parkify.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Reservation reservation;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private String paymentMethod; // STRIPE, CASH

    @Column(unique = true)
    private String gatewayTransactionId; // The Checkout Session ID

    @Column(nullable = false)
    private String status; // PENDING, PAID, FAILED, REFUND_REQUESTED, REFUNDED

    @Column(name = "refund_reason", length = 500)
    private String refundReason;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
