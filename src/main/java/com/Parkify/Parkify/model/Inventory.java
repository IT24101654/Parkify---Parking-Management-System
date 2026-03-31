package com.Parkify.Parkify.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "inventory")
public class Inventory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String itemName;      // Item Name / Part Name / Fuel Type
    private String inventoryType;  // FOOD, SPARE_PART, FUEL
    private String category;      // Category / Vehicle Type
    private Double quantity;      // Quantity / Liters
    private Double unitPrice;
    private String supplier;
    private LocalDate expiryDate;  // For Food only
    private Double thresholdValue;
    private LocalDate lastRestockDate; // For Fuel only

    @org.hibernate.annotations.CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private java.time.LocalDateTime createdAt;

    @org.hibernate.annotations.UpdateTimestamp
    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;
}
