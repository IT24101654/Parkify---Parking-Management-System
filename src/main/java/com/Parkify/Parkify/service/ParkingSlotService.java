package com.Parkify.Parkify.service;

import com.Parkify.Parkify.model.ParkingPlace;
import com.Parkify.Parkify.model.ParkingSlot;
import com.Parkify.Parkify.repository.ParkingRepository;
import com.Parkify.Parkify.repository.ParkingSlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ParkingSlotService {

    @Autowired
    private ParkingSlotRepository slotRepository;

    @Autowired
    private ParkingRepository parkingRepository;

    public List<ParkingSlot> getSlotsByPlace(Long placeId) {
        return slotRepository.findByParkingPlaceId(placeId);
    }

    public ParkingSlot saveSlot(ParkingSlot slot) {
        return slotRepository.save(slot);
    }

    public ParkingSlot updateSlot(Long id, ParkingSlot details) {
        ParkingSlot slot = slotRepository.findById(id).orElseThrow(() -> new RuntimeException("Slot not found with id: " + id));
        slot.setSlotName(details.getSlotName());
        slot.setSlotType(details.getSlotType());
        slot.setSlotStatus(details.getSlotStatus() != null ? details.getSlotStatus() : "Available");
        slot.setFloor(details.getFloor());
        slot.setZone(details.getZone());
        slot.setSection(details.getSection());
        slot.setNotes(details.getNotes());
        return slotRepository.save(slot);
    }

    public void deleteSlot(Long id) {
        if (!slotRepository.existsById(id)) {
            throw new RuntimeException("Slot not found with id: " + id);
        }
        slotRepository.deleteById(id);
    }

    public List<ParkingSlot> bulkCreate(Long placeId, String prefix, int count, String type) {
        ParkingPlace place = parkingRepository.findById(placeId).orElseThrow(() -> new RuntimeException("Parking Place not found with id: " + placeId));
        List<ParkingSlot> newSlots = new ArrayList<>();
        
        for (int i = 1; i <= count; i++) {
            ParkingSlot slot = new ParkingSlot();
            slot.setParkingPlace(place);
            slot.setSlotName(prefix + i);
            slot.setSlotType(type);
            slot.setSlotStatus("Available");
            newSlots.add(slotRepository.save(slot));
        }
        return newSlots;
    }
}
