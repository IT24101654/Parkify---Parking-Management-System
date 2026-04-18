package com.Parkify.Parkify.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceItemRequest {
    private String name;
    private String category;
    private String description;
    private Double price;
    private String estimatedTime;
    private Long serviceCenterId;
}
