package com.Parkify.Parkify.controller;

import com.Parkify.Parkify.dto.InventoryRequest;
import com.Parkify.Parkify.model.Inventory;
import com.Parkify.Parkify.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "http://localhost:3000")
public class InventoryController {

    @Autowired
    private InventoryService service;

    @PostMapping("/add")
    public Inventory add(@RequestBody InventoryRequest request) {
        return service.saveItem(request);
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
}
