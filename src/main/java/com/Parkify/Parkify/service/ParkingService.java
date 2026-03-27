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
        if (parkingRepository.existsByParkingNameAndLocationAndIdNot(details.getParkingName(), details.getLocation(), id)) {
            throw new IllegalArgumentException("A parking place with this name already exists.");
        }
        ParkingPlace place = parkingRepository.findById(id).orElseThrow();
        place.setParkingName(details.getParkingName());
        place.setSlots(details.getSlots());
        place.setLocation(details.getLocation());
        place.setPrice(details.getPrice());
        place.setType(details.getType());
        return parkingRepository.save(place);
    }

    public void updateParkingImage(Long id, String fileName) {
        ParkingPlace place = parkingRepository.findById(id).orElseThrow();
        place.setPlaceImage(fileName);
        parkingRepository.save(place);
    }
}