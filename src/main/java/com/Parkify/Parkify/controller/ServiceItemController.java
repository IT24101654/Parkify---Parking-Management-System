package com.Parkify.Parkify.controller;

import com.Parkify.Parkify.dto.ServiceItemRequest;
import com.Parkify.Parkify.dto.ServiceItemResponse;
import com.Parkify.Parkify.model.ServiceItem;
import com.Parkify.Parkify.service.ServiceItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/service-items")
@CrossOrigin(origins = "*")
public class ServiceItemController {

    @Autowired
    private ServiceItemService service;

    @GetMapping("/owner")
    public ResponseEntity<List<ServiceItemResponse>> getOwnerItems() {
        List<ServiceItemResponse> items = service.getOwnerItems()
                .stream().map(ServiceItemResponse::from).collect(Collectors.toList());
        return ResponseEntity.ok(items);
    }

    @GetMapping("/center/{centerId}")
    public ResponseEntity<List<ServiceItemResponse>> getItemsByCenter(@PathVariable Long centerId) {
        List<ServiceItemResponse> items = service.getItemsByServiceCenter(centerId)
                .stream().map(ServiceItemResponse::from).collect(Collectors.toList());
        return ResponseEntity.ok(items);
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody ServiceItemRequest request) {
        try {
            ServiceItem saved = service.saveItem(request);
            return ResponseEntity.ok(ServiceItemResponse.from(saved));
        } catch (Exception e) {
            System.err.println("ERROR saving service item: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody ServiceItemRequest request) {
        try {
            ServiceItem updated = service.updateItem(id, request);
            return ResponseEntity.ok(ServiceItemResponse.from(updated));
        } catch (Exception e) {
            System.err.println("ERROR updating service item " + id + ": " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            service.deleteItem(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            System.err.println("ERROR deleting service item " + id + ": " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
}
