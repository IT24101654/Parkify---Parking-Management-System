package com.Parkify.Parkify.controller;

import com.Parkify.Parkify.model.ParkingLocation;
import com.Parkify.Parkify.service.ParkingLocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parking-locations")
@CrossOrigin("*")
public class ParkingLocationController {

    @Autowired
    private ParkingLocationService parkingLocationService;

    @PostMapping("/add/{ownerId}")
    public ResponseEntity<?> addLocation(@PathVariable("ownerId") Long ownerId, @RequestBody ParkingLocation location) {
        try {
            ParkingLocation saved = parkingLocationService.addLocation(ownerId, location);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<ParkingLocation>> getOwnerLocations(@PathVariable("ownerId") Long ownerId) {
        return ResponseEntity.ok(parkingLocationService.getLocationsByOwner(ownerId));
    }

    @GetMapping("/{locationId}")
    public ResponseEntity<ParkingLocation> getLocation(@PathVariable("locationId") Long locationId) {
        return ResponseEntity.ok(parkingLocationService.getLocationById(locationId));
    }

    @PutMapping("/{locationId}")
    public ResponseEntity<?> updateLocation(@PathVariable("locationId") Long locationId, @RequestBody ParkingLocation updated) {
        try {
            return ResponseEntity.ok(parkingLocationService.updateLocation(locationId, updated));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{locationId}")
    public ResponseEntity<?> deleteLocation(@PathVariable("locationId") Long locationId) {
        parkingLocationService.deleteLocation(locationId);
        return ResponseEntity.ok("Parking Location deleted successfully");
    }
}
