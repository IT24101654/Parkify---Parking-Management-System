package com.Parkify.Parkify.serviceImpl;

import com.Parkify.Parkify.service.RecommendationService;
import org.springframework.stereotype.Service;

@Service
public class RecommendationServiceImpl implements RecommendationService {

    
    private static final double DISTANCE_WEIGHT = 0.5;
    private static final double PRICE_WEIGHT = 0.3;
    private static final double AVAILABILITY_WEIGHT = 0.2;

    @Override
    public double calculateRecommendationScore(double distance, double price, int availableSlots) {
        
        
        double score = (DISTANCE_WEIGHT * distance) + (PRICE_WEIGHT * price) - (AVAILABILITY_WEIGHT * availableSlots);
        return score;
    }
}