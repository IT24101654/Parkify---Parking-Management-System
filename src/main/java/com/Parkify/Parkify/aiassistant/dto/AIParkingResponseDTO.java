package com.Parkify.Parkify.aiassistant.dto;

import com.Parkify.Parkify.model.ParkingPlace;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AIParkingResponseDTO {
    private ParkingPlace recommendedPlace;
    private String reason;
    private Double score;
}
