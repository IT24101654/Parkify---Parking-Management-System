package com.Parkify.Parkify.service;

import com.Parkify.Parkify.model.FavoriteLocation;
import com.Parkify.Parkify.repository.FavoriteLocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FavoriteService {

    @Autowired
    private FavoriteLocationRepository favoriteRepository;

    public FavoriteLocation addFavorite(Long userId, Long parkingSlotId) {
        List<FavoriteLocation> existing = favoriteRepository.findByUserIdAndParkingSlotId(userId, parkingSlotId);
        if (!existing.isEmpty()) {
            throw new RuntimeException("Already favorited");
        }
        FavoriteLocation favorite = new FavoriteLocation();
        favorite.setUserId(userId);
        favorite.setParkingSlotId(parkingSlotId);
        return favoriteRepository.save(favorite);
    }

    public void removeFavorite(Long userId, Long parkingSlotId) {
        List<FavoriteLocation> favorites = favoriteRepository.findByUserIdAndParkingSlotId(userId, parkingSlotId);
        if (favorites.isEmpty()) {
            throw new RuntimeException("Favorite not found");
        }
        favoriteRepository.deleteAll(favorites); // Remove all duplicates at once
    }

    public List<FavoriteLocation> getFavoritesByUserId(Long userId) {
        return favoriteRepository.findByUserId(userId);
    }
}
