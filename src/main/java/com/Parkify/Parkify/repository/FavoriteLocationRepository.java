package com.Parkify.Parkify.repository;

import com.Parkify.Parkify.model.FavoriteLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteLocationRepository extends JpaRepository<FavoriteLocation, Long> {
    List<FavoriteLocation> findByUserId(Long userId);
    Optional<FavoriteLocation> findByUserIdAndParkingSlotId(Long userId, Long parkingSlotId);
    boolean existsByUserIdAndParkingSlotId(Long userId, Long parkingSlotId);
}