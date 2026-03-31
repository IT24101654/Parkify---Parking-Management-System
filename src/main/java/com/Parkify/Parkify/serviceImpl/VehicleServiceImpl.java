package com.Parkify.Parkify.serviceImpl;

import com.Parkify.Parkify.model.User;
import com.Parkify.Parkify.model.Vehicle;
import com.Parkify.Parkify.repository.VehicleRepository;
import com.Parkify.Parkify.repository.UserRepository;
import com.Parkify.Parkify.service.VehicleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class VehicleServiceImpl implements VehicleService {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public Vehicle addVehicle(Long userId, Vehicle vehicle, String vImage, String lImage) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        vehicle.setOwner(owner);
        vehicle.setVehicleImage(vImage);
        vehicle.setRevenueLicenseImage(lImage);

        return vehicleRepository.save(vehicle);
    }

    @Override
    public List<Vehicle> getVehiclesByUserId(Long userId) {
        return vehicleRepository.findByOwnerId(userId);
    }

    @Override
    public void deleteVehicle(Long vehicleId) {
        vehicleRepository.deleteById(vehicleId);
    }

    @Override
    public Vehicle updateVehicle(Long vehicleId, Vehicle vehicleDetails) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        vehicle.setBrand(vehicleDetails.getBrand());
        vehicle.setModel(vehicleDetails.getModel());
        vehicle.setFuelType(vehicleDetails.getFuelType());
        vehicle.setType(vehicleDetails.getType());

        return vehicleRepository.save(vehicle);
    }

    @Override
    public Vehicle getVehicleById(Long vehicleId) {
        return vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
    }
}