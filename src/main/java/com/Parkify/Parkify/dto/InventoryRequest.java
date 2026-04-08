package com.Parkify.Parkify.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class InventoryRequest {
    private String itemName;
    private String inventoryType;
    private String category;
    private Double quantity;
    private Double unitPrice;
    private String supplier;
    private LocalDate expiryDate;
    private Double thresholdValue;
    private LocalDate lastRestockDate;
    private Long parkingPlaceId;
}
