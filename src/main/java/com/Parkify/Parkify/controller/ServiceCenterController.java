package com.Parkify.Parkify.controller;

import com.Parkify.Parkify.model.ServiceCenter;
import com.Parkify.Parkify.service.ServiceCenterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/service-centers")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001", "http://localhost:3002",
        "http://localhost:3003" })
public class ServiceCenterController {

    @Autowired
    private ServiceCenterService serviceCenterService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<ServiceCenter> getByUserId(@PathVariable Long userId) {
        return serviceCenterService.getServiceCenterByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping("/save")
    public ResponseEntity<ServiceCenter> save(@RequestBody ServiceCenter serviceCenter) {
        return ResponseEntity.ok(serviceCenterService.saveServiceCenter(serviceCenter));
    }
}
