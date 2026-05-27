package com.Parkify.Parkify.repository;

import com.Parkify.Parkify.model.ParkingLocation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParkingLocationRepository extends MongoRepository<ParkingLocation, Long> {
    List<ParkingLocation> findByOwnerId(Long ownerId);
}


