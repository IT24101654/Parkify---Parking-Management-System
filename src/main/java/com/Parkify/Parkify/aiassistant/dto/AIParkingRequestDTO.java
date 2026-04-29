package com.Parkify.Parkify.aiassistant.dto;

import lombok.Data;

@Data
public class AIParkingRequestDTO {
    private String preferenceType;
    
    private Double latitude;
    private Double longitude;

    private String targetEntity;
}
