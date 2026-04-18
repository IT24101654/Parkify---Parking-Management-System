package com.Parkify.Parkify.aiassistant;

import com.Parkify.Parkify.aiassistant.dto.AIParkingRequestDTO;
import com.Parkify.Parkify.aiassistant.dto.AIParkingResponseDTO;
import com.Parkify.Parkify.model.ParkingPlace;
import com.Parkify.Parkify.repository.ParkingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIAssistantService {

    private final ParkingRepository parkingRepository;

    public AIParkingResponseDTO recommend(AIParkingRequestDTO request) {
        List<ParkingPlace> places = parkingRepository.findAll();
        // Filter out inactive ones
        places.removeIf(p -> !"ACTIVE".equalsIgnoreCase(p.getStatus()));

        if ("INVENTORY".equalsIgnoreCase(request.getTargetEntity())) {
            places.removeIf(p -> p.getHasInventory() == null || !p.getHasInventory());
            if (places.isEmpty()) throw new RuntimeException("No active inventory shops available.");
        } else if ("SERVICE".equalsIgnoreCase(request.getTargetEntity())) {
            places.removeIf(p -> p.getHasServiceCenter() == null || !p.getHasServiceCenter());
            if (places.isEmpty()) throw new RuntimeException("No active service centers available.");
        }

        if (places.isEmpty()) {
            throw new RuntimeException("No active parking places available.");
        }

        // 1. Find min and max for normalization
        double minPrice = Double.MAX_VALUE;
        double maxPrice = Double.MIN_VALUE;
        
        double minDistance = Double.MAX_VALUE;
        double maxDistance = Double.MIN_VALUE;
        
        int minSlots = Integer.MAX_VALUE;
        int maxSlots = Integer.MIN_VALUE;

        // Coordinates
        double userLat = (request.getLatitude() != null) ? request.getLatitude() : 6.9271;
        double userLng = (request.getLongitude() != null) ? request.getLongitude() : 79.8612;

        for (ParkingPlace p : places) {
            double price = getPrice(p);
            if (price < minPrice) minPrice = price;
            if (price > maxPrice) maxPrice = price;

            double dist = calculateDistance(userLat, userLng, getLat(p), getLng(p));
            if (dist < minDistance) minDistance = dist;
            if (dist > maxDistance) maxDistance = dist;

            int slots = p.getSlots();
            if (slots < minSlots) minSlots = slots;
            if (slots > maxSlots) maxSlots = slots;
        }

        // Avoid division by zero
        if (maxPrice == minPrice) maxPrice = minPrice + 1;
        if (maxDistance == minDistance) maxDistance = minDistance + 1;
        if (maxSlots == minSlots) maxSlots = minSlots + 1;

        // 2. Determine weights based on preference
        String pref = (request.getPreferenceType() != null) ? request.getPreferenceType().toUpperCase() : "BALANCED";
        double wp = 0.33, wd = 0.33, wa = 0.33; // Default BALANCED
        String reasonTemplate = "Best overall balance for your trip.";

        switch (pref) {
            case "CHEAPEST":
                wp = 0.6; wd = 0.2; wa = 0.2;
                reasonTemplate = "Recommended because it has the lowest price among available options.";
                break;
            case "NEAREST":
                wp = 0.2; wd = 0.6; wa = 0.2;
                reasonTemplate = "Recommended because it's the closest parking place to your location.";
                break;
            case "MOST_AVAILABLE":
                wp = 0.2; wd = 0.2; wa = 0.6;
                reasonTemplate = "Recommended because it has the highest capacity and plenty of space.";
                break;
        }

        // 3. Calculate scores
        ParkingPlace bestPlace = null;
        double bestScore = Double.MAX_VALUE;

        for (ParkingPlace p : places) {
            double price = getPrice(p);
            double dist = calculateDistance(userLat, userLng, getLat(p), getLng(p));
            int slots = p.getSlots();

            double normPrice = (price - minPrice) / (maxPrice - minPrice);
            double normDist = (dist - minDistance) / (maxDistance - minDistance);
            double normAvail = (double)(slots - minSlots) / (maxSlots - minSlots);

            // Calculation: lower price and lower distance is better, higher availability is better (so subtract it)
            double score = (wp * normPrice) + (wd * normDist) - (wa * normAvail);

            if (score < bestScore) {
                bestScore = score;
                bestPlace = p;
            }
        }

        return AIParkingResponseDTO.builder()
                .recommendedPlace(bestPlace)
                .score(bestScore)
                .reason(reasonTemplate)
                .build();
    }

    private double getPrice(ParkingPlace p) {
        return p.getPrice();
    }

    private double getLat(ParkingPlace p) {
        return (p.getLatitude() != null) ? p.getLatitude() : 6.9271;
    }

    private double getLng(ParkingPlace p) {
        return (p.getLongitude() != null) ? p.getLongitude() : 79.8612;
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth Radius in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; 
    }
}
