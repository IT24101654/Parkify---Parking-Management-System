package com.Parkify.Parkify.repository;

import com.Parkify.Parkify.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    List<Vehicle> findByOwnerId(Long userId);
    Optional<Vehicle> findByVehicleNumber(String vehicleNumber);
}