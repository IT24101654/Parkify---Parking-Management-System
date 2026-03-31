package com.Parkify.Parkify.repository;

import com.Parkify.Parkify.model.FavoriteLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FavoriteLocationRepository extends JpaRepository<FavoriteLocation, Long> {
    List<FavoriteLocation> findByUserId(Long userId);
    boolean existsByUserIdAndParkingSlotId(Long userId, Long parkingSlotId);
}