package com.Parkify.Parkify.repository;

import com.Parkify.Parkify.model.Vehicle;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends MongoRepository<Vehicle, Long> {
    List<Vehicle> findByOwner_Id(Long userId);
    Optional<Vehicle> findByVehicleNumber(String vehicleNumber);
}

