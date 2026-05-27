package com.Parkify.Parkify.repository;

import com.Parkify.Parkify.model.FavoriteLocation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FavoriteLocationRepository extends MongoRepository<FavoriteLocation, Long> {
    List<FavoriteLocation> findByUserId(Long userId);
    List<FavoriteLocation> findByUserIdAndParkingSlotId(Long userId, Long parkingSlotId);
    boolean existsByUserIdAndParkingSlotId(Long userId, Long parkingSlotId);
}

