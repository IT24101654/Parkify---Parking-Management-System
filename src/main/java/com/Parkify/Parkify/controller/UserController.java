package com.Parkify.Parkify.controller;

import com.Parkify.Parkify.dto.ForgotPasswordRequest;
import com.Parkify.Parkify.dto.ResetPasswordRequest;
import com.Parkify.Parkify.dto.AdminUserDTO;
import com.Parkify.Parkify.model.User;
import com.Parkify.Parkify.service.UserServiceExtra;
import com.Parkify.Parkify.service.UserService;
import com.Parkify.Parkify.service.VehicleService;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired private UserService userService;
    @Autowired private UserServiceExtra userExtraService;
    @Autowired private VehicleService vehicleService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody User user) {
        User registeredUser = userService.registerUser(user);
        userExtraService.logActivity(registeredUser.getId(), "USER_REGISTERED");
        return ResponseEntity.ok(registeredUser);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllUsersForAdmin() {
        List<User> users = userService.getAllUsers();
        List<AdminUserDTO> adminUsers = new ArrayList<>();

        for (User user : users) {
            AdminUserDTO dto = new AdminUserDTO();
            dto.setId(user.getId());
            dto.setName(user.getName());
            dto.setEmail(user.getEmail());
            dto.setPhoneNumber(user.getPhoneNumber());
            dto.setRole(user.getRole());
            dto.setActive(user.getActive());
            dto.setAddress(user.getAddress());
            dto.setProfilePicture(user.getProfilePicture());

            if (user.getRole() != null && user.getRole().name().equals("DRIVER")) {
                dto.setVehicles(vehicleService.getVehiclesByUserId(user.getId()));
            } else {
                dto.setVehicles(new ArrayList<>());
            }

            adminUsers.add(dto);
        }

        return ResponseEntity.ok(adminUsers);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(org.springframework.security.core.Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(userService.getUserByEmail(email));
    }

    @PutMapping("/{id}/profile")
    public ResponseEntity<?> updateProfile(@PathVariable("id") Long id,
                                           @RequestBody Map<String, String> data) {

        String name = data.get("name");
        String phone = data.get("phoneNumber");
        String address = data.get("address");
        String nic = data.get("nicNumber");

        User updated = userService.updateProfile(id, name, phone, address, nic);
        userExtraService.logActivity(id, "PROFILE_UPDATED");

        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/upload-profile-image")
    public ResponseEntity<?> uploadProfileImage(@PathVariable("id") Long id,
                                                @RequestParam("file") MultipartFile file) throws IOException {

        String uploadDir = "user-photos/";
        new File(uploadDir).mkdirs();

        String fileName = "PROFILE_" + id + "_" + file.getOriginalFilename();
        Files.copy(file.getInputStream(), Paths.get(uploadDir + fileName), StandardCopyOption.REPLACE_EXISTING);

        userService.updateProfilePicture(id, fileName);

        return ResponseEntity.ok(Map.of("fileName", fileName));
    }

    @GetMapping("/profile-image/{fileName}")
    public ResponseEntity<org.springframework.core.io.Resource> getProfileImage(@PathVariable("fileName") String fileName) {
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
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable("id") Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("User removed successfully");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        userService.forgotPassword(request.getEmail());
        return ResponseEntity.ok(Map.of("message", "OTP sent"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        userService.resetPassword(
                request.getEmail(),
                request.getOtp(),
                request.getNewPassword()
        );
        return ResponseEntity.ok(Map.of("message", "Password reset successful"));
    }
}

