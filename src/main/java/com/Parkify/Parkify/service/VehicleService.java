package com.Parkify.Parkify.service;

import com.Parkify.Parkify.model.Vehicle;
import java.util.List;

public interface VehicleService {
    Vehicle addVehicle(Long userId, Vehicle vehicle, String vImage, String lImage);
    List<Vehicle> getVehiclesByUserId(Long userId);
    Vehicle updateVehicle(Long vehicleId, Vehicle vehicleDetails);
    void deleteVehicle(Long vehicleId);
    Vehicle getVehicleById(Long vehicleId);
}