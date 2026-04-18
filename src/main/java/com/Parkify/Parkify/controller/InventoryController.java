package com.Parkify.Parkify.controller;

import com.Parkify.Parkify.dto.InventoryRequest;
import com.Parkify.Parkify.model.Inventory;
import com.Parkify.Parkify.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "*") // Allow for easier testing
public class InventoryController {

    @Autowired
    private InventoryService service;

    @PostMapping("/add")
    public Inventory add(@RequestBody InventoryRequest request) {
        return Objects.requireNonNull(service.saveItem(request), "Inventory item could not be saved");
    }

    @GetMapping("/type/{type}")
    public List<Inventory> getByType(@PathVariable String type) {
        return service.getItemsByType(type);
    }

    @GetMapping("/driver/type/{type}")
    public List<Inventory> getByTypeForDriver(@PathVariable String type) {
        return service.getItemsByTypeForDriver(type);
    }

    @PutMapping("/{id}")
    public Inventory update(@PathVariable Long id, @RequestBody InventoryRequest request) {
        return service.updateItem(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.deleteItem(id);
    }

    @GetMapping("/owner")
    public List<Inventory> getOwnerInventory() {
        return service.getOwnerInventory();
    }

    @GetMapping("/owner/type/{type}")
    public List<Inventory> getOwnerInventoryByType(@PathVariable String type) {
        return service.getOwnerInventoryByType(type);
    }

    @GetMapping("/user/{userId}")
    public List<Inventory> getByUserId(@PathVariable Long userId) {
        return service.getItemsByUserId(userId);
    }

    @GetMapping("/by-parking-place/{parkingPlaceId}")
    public List<Inventory> getByParkingPlaceId(@PathVariable Long parkingPlaceId) {
        System.out.println("DEBUG: Fetching inventory for ParkingPlaceId: " + parkingPlaceId);
        List<Inventory> results = service.getItemsByParkingPlace(parkingPlaceId);
        System.out.println("DEBUG: Found " + results.size() + " items");
        return results;
    }

    @GetMapping("/by-parking-place/{parkingPlaceId}/type/{type}")
    public List<Inventory> getByParkingPlaceIdAndType(@PathVariable Long parkingPlaceId, @PathVariable String type) {
        System.out.println("DEBUG: Fetching inventory for ParkingPlaceId: " + parkingPlaceId + ", Type: " + type);
        List<Inventory> results = service.getItemsByParkingPlaceAndType(parkingPlaceId, type);
        System.out.println("DEBUG: Found " + results.size() + " items");
        return results;
    }
}
