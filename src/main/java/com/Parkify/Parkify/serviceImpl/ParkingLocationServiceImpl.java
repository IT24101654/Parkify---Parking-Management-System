package com.Parkify.Parkify.serviceImpl;

import com.Parkify.Parkify.model.ParkingLocation;
import com.Parkify.Parkify.model.User;
import com.Parkify.Parkify.repository.ParkingLocationRepository;
import com.Parkify.Parkify.repository.UserRepository;
import com.Parkify.Parkify.service.ParkingLocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ParkingLocationServiceImpl implements ParkingLocationService {

    @Autowired
    private ParkingLocationRepository parkingLocationRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public ParkingLocation addLocation(Long ownerId, ParkingLocation location) {
        User owner = userRepository.findById(ownerId).orElseThrow(() -> new RuntimeException("Owner not found"));
        location.setOwner(owner);
        return parkingLocationRepository.save(location);
    }

    @Override
    public List<ParkingLocation> getLocationsByOwner(Long ownerId) {
        return parkingLocationRepository.findByOwnerId(ownerId);
    }

    @Override
    public ParkingLocation getLocationById(Long locationId) {
        return parkingLocationRepository.findById(locationId)
                .orElseThrow(() -> new RuntimeException("Parking Location not found"));
    }

    @Override
    public ParkingLocation updateLocation(Long locationId, ParkingLocation updatedData) {
        ParkingLocation existing = getLocationById(locationId);
        existing.setName(updatedData.getName());
        existing.setAddress(updatedData.getAddress());
        existing.setLatitude(updatedData.getLatitude());
        existing.setLongitude(updatedData.getLongitude());
        existing.setAvailableFrom(updatedData.getAvailableFrom());
        existing.setAvailableTo(updatedData.getAvailableTo());
        if (updatedData.getActive() != null) {
            existing.setActive(updatedData.getActive());
        }
        return parkingLocationRepository.save(existing);
    }

    @Override
    public void deleteLocation(Long locationId) {
        parkingLocationRepository.deleteById(locationId);
    }
}
