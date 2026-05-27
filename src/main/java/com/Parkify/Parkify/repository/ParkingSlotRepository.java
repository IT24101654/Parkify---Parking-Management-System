package com.Parkify.Parkify.repository;

import com.Parkify.Parkify.model.ParkingSlot;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParkingSlotRepository extends MongoRepository<ParkingSlot, Long> {
    List<ParkingSlot> findByParkingPlaceId(Long parkingPlaceId);
}


