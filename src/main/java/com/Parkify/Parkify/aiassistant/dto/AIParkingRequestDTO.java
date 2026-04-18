package com.Parkify.Parkify.aiassistant.dto;

import lombok.Data;

@Data
public class AIParkingRequestDTO {
    // Expected values: "CHEAPEST", "NEAREST", "MOST_AVAILABLE", or anything else defaults to BALANCED
    private String preferenceType;
    
    // User's current location (mocked or actual from frontend)
    private Double latitude;
    private Double longitude;

    // "PARKING", "INVENTORY", or "SERVICE"
    private String targetEntity;
}
