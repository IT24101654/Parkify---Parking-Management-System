package com.Parkify.Parkify.controller;

import com.Parkify.Parkify.dto.ForgotPasswordRequest;
import com.Parkify.Parkify.dto.ResetPasswordRequest;
import com.Parkify.Parkify.model.User;
import com.Parkify.Parkify.service.UserServiceExtra;
import com.Parkify.Parkify.service.UserService;
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
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserServiceExtra userExtraService;

    // --- පවතින Methods ---

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

    // IMPORTANT: මේක තමයි ඔයාගේ ප්‍රශ්නය විසඳන Method එක!
    // Frontend එකෙන් GET /api/users/1 එවද්දී වැඩ කරන්නේ මේක.
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            User user = userService.getUserById(id);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
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

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(org.springframework.security.core.Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthenticated");
            }
            String email = authentication.getName();
            User user = userService.getUserByEmail(email);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
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

    @PostMapping("/{id}/upload-profile-image")
    public ResponseEntity<?> uploadProfileImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body("No file uploaded");
            }

            if (file.getSize() > 5 * 1024 * 1024) { // 5 MB limit
                return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                        .body("File size exceeds 5MB limit");
            }

            String contentType = file.getContentType();
            if (contentType == null || !(contentType.startsWith("image/"))) {
                return ResponseEntity.badRequest().body("Only image file uploads are allowed");
            }

            String uploadDir = "user-photos/";
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            String fileName = "PROFILE_" + id + "_" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(uploadDir + fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            userService.updateProfilePicture(id, fileName);
            userExtraService.logActivity(id, "PROFILE_IMAGE_UPDATED");

            return ResponseEntity.ok(Map.of(
                    "message", "Profile image uploaded successfully",
                    "fileName", fileName
            ));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
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

    // --- අනෙකුත් Methods ---
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id){
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok("User removed successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            userService.forgotPassword(request.getEmail().trim().toLowerCase());
            return ResponseEntity.ok(Map.of("message", "OTP sent successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            boolean result = userService.resetPassword(
                    request.getEmail().trim().toLowerCase(),
                    request.getOtp(),
                    request.getNewPassword()
            );
            return result ? ResponseEntity.ok(Map.of("message", "Password reset successful"))
                    : ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Invalid OTP"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }
}