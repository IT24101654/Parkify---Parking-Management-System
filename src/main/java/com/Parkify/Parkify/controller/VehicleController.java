package com.Parkify.Parkify.controller;

import com.Parkify.Parkify.model.Vehicle;
import com.Parkify.Parkify.service.VehicleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class VehicleController {

    @Autowired
    private VehicleService vehicleService;

    @Autowired
    private com.Parkify.Parkify.service.CloudinaryService cloudinaryService;

    @PostMapping("/add/{userId}")
    public ResponseEntity<?> addVehicle(
            @PathVariable("userId") Long userId,
            @RequestParam("vehicleNumber") String vehicleNumber,
            @RequestParam("brand") String brand,
            @RequestParam("model") String model,
            @RequestParam("type") String type,
            @RequestParam("fuelType") String fuelType,
            @RequestParam("vehicleImage") MultipartFile vImage,
            @RequestParam("licenseImage") MultipartFile lImage) {

        try {
            String vUrl = null;
            if (vImage != null && !vImage.isEmpty()) {
                vUrl = cloudinaryService.uploadImage(vImage, "vehicles");
            }
            
            String lUrl = null;
            if (lImage != null && !lImage.isEmpty()) {
                lUrl = cloudinaryService.uploadImage(lImage, "licenses");
            }

            Vehicle vehicle = new Vehicle();
            vehicle.setVehicleNumber(vehicleNumber);
            vehicle.setBrand(brand);
            vehicle.setModel(model);
            vehicle.setType(type);
            vehicle.setFuelType(fuelType);

            Vehicle savedVehicle = vehicleService.addVehicle(userId, vehicle, vUrl, lUrl);
            return ResponseEntity.ok(savedVehicle);

        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Vehicle number is already registered.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Vehicle>> getUserVehicles(@PathVariable("userId") Long userId) {
        return ResponseEntity.ok(vehicleService.getVehiclesByUserId(userId));
    }

    @DeleteMapping("/{vehicleId}")
    public ResponseEntity<String> deleteVehicle(@PathVariable("vehicleId") Long vehicleId) {
        vehicleService.deleteVehicle(vehicleId);
        return ResponseEntity.ok("Vehicle deleted successfully");
    }

    @GetMapping("/{vehicleId}")
    public ResponseEntity<Vehicle> getVehicleById(@PathVariable("vehicleId") Long vehicleId) {
        return ResponseEntity.ok(vehicleService.getVehicleById(vehicleId));
    }

    @PutMapping("/{vehicleId}")
    public ResponseEntity<?> updateVehicle(
            @PathVariable("vehicleId") Long vehicleId,
            @RequestParam("vehicleNumber") String vehicleNumber,
            @RequestParam("brand") String brand,
            @RequestParam("model") String model,
            @RequestParam("type") String type,
            @RequestParam("fuelType") String fuelType,
            @RequestParam(value = "vehicleImage", required = false) MultipartFile vImage,
            @RequestParam(value = "licenseImage", required = false) MultipartFile lImage) {

        try {
            String vUrl = null;
            if (vImage != null && !vImage.isEmpty()) {
                vUrl = cloudinaryService.uploadImage(vImage, "vehicles");
            }

            String lUrl = null;
            if (lImage != null && !lImage.isEmpty()) {
                lUrl = cloudinaryService.uploadImage(lImage, "licenses");
            }

            Vehicle vehicle = new Vehicle();
            vehicle.setVehicleNumber(vehicleNumber);
            vehicle.setBrand(brand);
            vehicle.setModel(model);
            vehicle.setType(type);
            vehicle.setFuelType(fuelType);

            Vehicle updatedVehicle = vehicleService.updateVehicle(vehicleId, vehicle, vUrl, lUrl);
            return ResponseEntity.ok(updatedVehicle);

        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Vehicle number is already registered.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/docs/{fileName:.+}")
    public ResponseEntity<org.springframework.core.io.Resource> getVehicleDocument(@PathVariable("fileName") String fileName) {
        try {
            Path path = Paths.get("vehicle-docs/").resolve(fileName);
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(path.toUri());

            if (resource.exists() || resource.isReadable()) {
                return ResponseEntity.ok()
                        .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, "image/jpeg")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}



