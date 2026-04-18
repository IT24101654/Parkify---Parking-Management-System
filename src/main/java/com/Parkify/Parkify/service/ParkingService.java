package com.Parkify.Parkify.service;

import com.Parkify.Parkify.model.ParkingPlace;
import com.Parkify.Parkify.repository.ParkingRepository;
import com.Parkify.Parkify.repository.UserRepository;
import com.Parkify.Parkify.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ParkingService {

    @Autowired
    private ParkingRepository parkingRepository;

    @Autowired
    private UserRepository userRepository;

    public List<ParkingPlace> getAllParkingPlaces() {
        List<ParkingPlace> places = parkingRepository.findAll();
        places.forEach(this::populateFlags);
        return places;
    }

    public List<ParkingPlace> getParkingPlacesByOwner(Long ownerId) {
        List<ParkingPlace> places = parkingRepository.findByOwnerId(ownerId);
        places.forEach(this::populateFlags);
        return places;
    }

    private void populateFlags(ParkingPlace place) {
        if (place.getOwnerId() != null) {
            userRepository.findById(place.getOwnerId()).ifPresent(u -> place.setOwnerEmail(u.getEmail()));
        }
    }

    public ParkingPlace updateFeatureFlags(Long id, Boolean hasInventory, Boolean hasServiceCenter) {
        ParkingPlace place = parkingRepository.findById(id).orElseThrow();
        if (hasInventory != null) place.setHasInventory(hasInventory);
        if (hasServiceCenter != null) place.setHasServiceCenter(hasServiceCenter);
        return parkingRepository.save(place);
    }

    public ParkingPlace saveParkingPlace(ParkingPlace place) {
        if (parkingRepository.existsByParkingNameAndLocation(place.getParkingName(), place.getLocation())) {
            throw new IllegalArgumentException("A parking place with this name already exists.");
        }
        ParkingPlace saved = parkingRepository.save(place);
        populateFlags(saved);
        return saved;
    }

    public void deleteParkingPlace(Long id) {
        parkingRepository.deleteById(id);
    }

    public ParkingPlace updateParkingPlace(Long id, ParkingPlace details) {
        if (parkingRepository.existsByParkingNameAndLocationAndIdNot(details.getParkingName(), details.getLocation(),
                id)) {
            throw new IllegalArgumentException("A parking place with this name already exists.");
        }
        ParkingPlace place = parkingRepository.findById(id).orElseThrow();
        place.setParkingName(details.getParkingName());
        place.setSlots(details.getSlots());
        place.setDescription(details.getDescription());
        place.setAddress(details.getAddress());
        place.setCity(details.getCity());
        place.setArea(details.getArea());
        place.setOpenHours(details.getOpenHours());
        place.setCloseHours(details.getCloseHours());
        place.setIs24Hours(details.getIs24Hours());
        place.setWeekendAvailable(details.getWeekendAvailable());
        place.setTemporaryClosed(details.getTemporaryClosed());
        place.setStatus(details.getStatus());
        place.setLocation(details.getLocation());
        place.setPrice(details.getPrice());
        place.setDailyPrice(details.getDailyPrice());
        place.setWeekendPrice(details.getWeekendPrice());
        place.setType(details.getType());
        place.setLatitude(details.getLatitude());
        place.setLongitude(details.getLongitude());
        ParkingPlace updated = parkingRepository.save(place);
        populateFlags(updated);
        return updated;
    }

    public void updateParkingImage(Long id, String fileName) {
        ParkingPlace place = parkingRepository.findById(id).orElseThrow();
        place.setPlaceImage(fileName);
        parkingRepository.save(place);
    }
}