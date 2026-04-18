package com.Parkify.Parkify.service;

import com.Parkify.Parkify.model.ParkingPlace;
import com.Parkify.Parkify.repository.ParkingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ParkingService {

    @Autowired
    private ParkingRepository parkingRepository;

    public List<ParkingPlace> getAllParkingPlaces() {
        return parkingRepository.findAll();
    }

    public List<ParkingPlace> getParkingPlacesByOwner(Long ownerId) {
        return parkingRepository.findByOwnerId(ownerId);
    }

    public ParkingPlace saveParkingPlace(ParkingPlace place) {
        if (parkingRepository.existsByParkingNameAndLocation(place.getParkingName(), place.getLocation())) {
            throw new IllegalArgumentException("A parking place with this name already exists.");
        }
        return parkingRepository.save(place);
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
        return parkingRepository.save(place);
    }

    public void updateParkingImage(Long id, String fileName) {
        ParkingPlace place = parkingRepository.findById(id).orElseThrow();
        place.setPlaceImage(fileName);
        parkingRepository.save(place);
    }
}