package com.Parkify.Parkify.service;

import com.Parkify.Parkify.model.ParkingLocation;
import java.util.List;

public interface ParkingLocationService {
    ParkingLocation addLocation(Long ownerId, ParkingLocation location);
    List<ParkingLocation> getLocationsByOwner(Long ownerId);
    ParkingLocation getLocationById(Long locationId);
    ParkingLocation updateLocation(Long locationId, ParkingLocation updatedLocation);
    void deleteLocation(Long locationId);
}
