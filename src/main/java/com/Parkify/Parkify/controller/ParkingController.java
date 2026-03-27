package com.Parkify.Parkify.controller;

import com.Parkify.Parkify.model.ParkingPlace;
import com.Parkify.Parkify.service.ParkingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/parking")
@CrossOrigin(origins = "http://localhost:3002") // Frontend port එකට ගැලපෙන්න
public class ParkingController {

    @Autowired
    private ParkingService parkingService;

    @GetMapping
    public List<ParkingPlace> getAll() {
        return parkingService.getAllParkingPlaces();
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody ParkingPlace place) {
        try {
            return ResponseEntity.ok(parkingService.saveParkingPlace(place));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> update(@PathVariable("id") Long id, @RequestBody ParkingPlace place) {
        try {
            return ResponseEntity.ok(parkingService.updateParkingPlace(id, place));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/delete/{id}")
    public void delete(@PathVariable("id") Long id) {
        parkingService.deleteParkingPlace(id);
    }

    @PostMapping("/{id}/upload-image")
    public ResponseEntity<?> uploadParkingImage(
            @PathVariable("id") Long id,
            @RequestParam("file") MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body("No file uploaded");
            }
            if (file.getSize() > 5 * 1024 * 1024) { 
                return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                        .body("File size exceeds 5MB limit");
            }
            String contentType = file.getContentType();
            if (contentType == null || !(contentType.startsWith("image/"))) {
                return ResponseEntity.badRequest().body("Only image file uploads are allowed");
            }

            String uploadDir = "parking-photos/";
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            String fileName = "PARKING_" + id + "_" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(uploadDir + fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            parkingService.updateParkingImage(id, fileName);

            return ResponseEntity.ok(Map.of(
                    "message", "Parking image uploaded successfully",
                    "fileName", fileName
            ));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/image/{fileName}")
    public ResponseEntity<org.springframework.core.io.Resource> getParkingImage(@PathVariable("fileName") String fileName) {
        try {
            Path path = Paths.get("parking-photos/").resolve(fileName);
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(path.toUri());
            if (resource.exists() || resource.isReadable()) {
                return ResponseEntity.ok()
                        .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, "image/jpeg")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}