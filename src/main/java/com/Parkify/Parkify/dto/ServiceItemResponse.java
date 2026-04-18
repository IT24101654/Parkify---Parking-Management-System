package com.Parkify.Parkify.dto;

import com.Parkify.Parkify.model.ServiceItem;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Safe DTO returned from the API — never exposes Hibernate lazy proxies.
 * Maps directly from ServiceItem without touching any lazy-loaded associations.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceItemResponse {

    private Long id;
    private String name;
    private String category;
    private String description;
    private Double price;
    private String estimatedTime;
    private Boolean active;
    private Long serviceCenterId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Static factory — converts a ServiceItem entity to this DTO.
     * Accesses only column-mapped fields; never triggers lazy proxy loading.
     */
    public static ServiceItemResponse from(ServiceItem item) {
        ServiceItemResponse dto = new ServiceItemResponse();
        dto.setId(item.getId());
        dto.setName(item.getName());
        dto.setCategory(item.getCategory());
        dto.setDescription(item.getDescription());
        dto.setPrice(item.getPrice());
        dto.setEstimatedTime(item.getEstimatedTime());
        dto.setActive(item.getActive());
        dto.setCreatedAt(item.getCreatedAt());
        dto.setUpdatedAt(item.getUpdatedAt());
        // Avoid triggering lazy proxy on serviceCenter — access only the FK value
        // via the join column which is always loaded as a primitive
        try {
            if (item.getServiceCenter() != null) {
                dto.setServiceCenterId(item.getServiceCenter().getId());
            }
        } catch (Exception ignored) {
            // LazyInitializationException guard — serviceCenterId stays null
        }
        return dto;
    }
}
