package com.Parkify.Parkify.controller;

import com.Parkify.Parkify.model.ParkingSlot;
import com.Parkify.Parkify.service.ParkingSlotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/slots")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003" })
public class ParkingSlotController {

    @Autowired
    private ParkingSlotService slotService;

    @GetMapping("/place/{placeId}")
    public List<ParkingSlot> getSlotsByPlace(@PathVariable Long placeId) {
        return slotService.getSlotsByPlace(placeId);
    }

    @PostMapping("/add")
    public ResponseEntity<ParkingSlot> addSlot(@RequestBody ParkingSlot slot) {
        return ResponseEntity.ok(slotService.saveSlot(slot));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ParkingSlot> updateSlot(@PathVariable Long id, @RequestBody ParkingSlot details) {
        return ResponseEntity.ok(slotService.updateSlot(id, details));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteSlot(@PathVariable Long id) {
        slotService.deleteSlot(id);
        return ResponseEntity.ok(Map.of("message", "Slot deleted successfully"));
    }

    @PostMapping("/bulk-create")
    public ResponseEntity<List<ParkingSlot>> bulkCreate(@RequestBody Map<String, Object> payload) {
        Long placeId = Long.valueOf(payload.get("placeId").toString());
        String prefix = payload.get("prefix").toString();
        int count = Integer.parseInt(payload.get("count").toString());
        String type = payload.get("type").toString();
        return ResponseEntity.ok(slotService.bulkCreate(placeId, prefix, count, type));
    }
}
