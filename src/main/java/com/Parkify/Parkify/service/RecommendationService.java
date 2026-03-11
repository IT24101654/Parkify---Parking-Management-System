package com.Parkify.Parkify.service;

public interface RecommendationService {
    double calculateRecommendationScore(double distance, double price, int availableSlots);
}