package com.Parkify.Parkify.controller;

import com.Parkify.Parkify.model.User;
import com.Parkify.Parkify.service.UserServiceExtra;
import com.Parkify.Parkify.service.userservice;
import jakarta.validation.Valid;
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
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class usercontroller {

    @Autowired
    private userservice userService;

    @Autowired
    private UserServiceExtra userExtraService; // අලුත් Service එක Inject කිරීම

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody User user) {
        try {
            User registeredUser = userService.registerUser(user);
            userExtraService.logActivity(registeredUser.getId(), "USER_REGISTERED");
            return ResponseEntity.ok(registeredUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> credentials) {
        try {
            String email = credentials.get("email");
            String password = credentials.get("password");
            User user = userService.loginUser(email, password);

            userExtraService.logActivity(user.getId(), "USER_LOGGED_IN");

            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id){
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok("User removed successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        try {
            return ResponseEntity.ok(userService.getAllUsers());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/profile")
    public ResponseEntity<?> updateFullProfile(
            @PathVariable Long id,
            @RequestBody Map<String, String> data) {
        try {
            String name = data.get("name");
            String phoneNumber = data.get("phoneNumber");
            String address = data.get("address");

            User updatedUser = userService.updateProfile(id, name, phoneNumber, address);

            userExtraService.logActivity(id, "PROFILE_UPDATED");

            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/verify-nic")
    public ResponseEntity<?> verifyNic(
            @PathVariable Long id,
            @RequestParam("nicNumber") String nicNumber,
            @RequestParam("file") MultipartFile file) {
        try {
            String uploadDir = "user-verification/";
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            String fileName = "NIC_" + id + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(uploadDir + fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            userService.updateVerificationDetails(id, nicNumber, fileName);

            userExtraService.logActivity(id, "NIC_VERIFICATION_SUBMITTED");

            return ResponseEntity.ok(Map.of(
                    "message", "NIC details uploaded successfully",
                    "nicNumber", nicNumber,
                    "nicImage", fileName
            ));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error uploading NIC: " + e.getMessage());
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(org.springframework.security.core.Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userService.getUserByEmail(email);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/profile-image/{fileName}")
    public ResponseEntity<org.springframework.core.io.Resource> getProfileImage(@PathVariable String fileName) {
        try {
            Path path = Paths.get("user-photos/").resolve(fileName);
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