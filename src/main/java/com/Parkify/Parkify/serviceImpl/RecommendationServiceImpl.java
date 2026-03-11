package com.Parkify.Parkify.serviceImpl;

import com.Parkify.Parkify.service.RecommendationService;
import org.springframework.stereotype.Service;

@Service
public class RecommendationServiceImpl implements RecommendationService {

    // Dynamic weights setup (Can be moved to DB for runtime tuning later)
    private static final double DISTANCE_WEIGHT = 0.5;
    private static final double PRICE_WEIGHT = 0.3;
    private static final double AVAILABILITY_WEIGHT = 0.2;

    @Override
    public double calculateRecommendationScore(double distance, double price, int availableSlots) {
        // Multi-factor scoring formula implementation
        // Lower score is better (lower distance/price, higher availability reduces penalty)
        double score = (DISTANCE_WEIGHT * distance) + (PRICE_WEIGHT * price) - (AVAILABILITY_WEIGHT * availableSlots);
        return score;
    }
}