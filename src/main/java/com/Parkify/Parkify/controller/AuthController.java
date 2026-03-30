package com.Parkify.Parkify.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.Parkify.Parkify.dto.LoginRequest;
import com.Parkify.Parkify.dto.RegisterRequest;
import com.Parkify.Parkify.dto.VerifyRequest;
import com.Parkify.Parkify.model.Role;
import com.Parkify.Parkify.model.User;
import com.Parkify.Parkify.service.EmailService;
import com.Parkify.Parkify.service.JwtService;
import com.Parkify.Parkify.service.OtpService;
import com.Parkify.Parkify.service.RegistrationService;
import com.Parkify.Parkify.service.UserService;
import com.Parkify.Parkify.service.NotificationService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired private OtpService otpService;
    @Autowired private EmailService emailService;
    @Autowired private JwtService jwtService;
    @Autowired private UserService userService;
    @Autowired private RegistrationService registrationService;
    @Autowired private NotificationService notificationService;


    

    @PostMapping("/register-otp")
    public ResponseEntity<?> sendOtpForRegistration(@RequestBody RegisterRequest registerRequest) {
        String email = registerRequest.getEmail().trim().toLowerCase();

        
        Role role;
        if (registerRequest.getRole() != null && !registerRequest.getRole().isBlank()) {
            try {
                role = Role.valueOf(registerRequest.getRole().toUpperCase());
            } catch (IllegalArgumentException ex) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Invalid role. Must be DRIVER, PARKING_OWNER, or SUPER_ADMIN"));
            }
        } else {
            role = Role.DRIVER;
        }

        
        if (role == Role.SUPER_ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "SUPER_ADMIN cannot be created through public registration."));
        }

        
        List<String> existingRoles = userService.getRolesForEmail(email);
        if (existingRoles.contains(role.name())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "This email is already registered as " + role.name()));
        }

        
        User pending = new User();
        pending.setName(registerRequest.getName());
        pending.setEmail(email);
        pending.setPassword(registerRequest.getPassword());
        pending.setPhoneNumber(registerRequest.getPhoneNumber());
        pending.setAddress(registerRequest.getAddress() != null ? registerRequest.getAddress() : "");
        pending.setHasInventory(registerRequest.isHasInventory());
        pending.setHasServiceCenter(registerRequest.isHasServiceCenter());
        pending.setRole(role);
        
        if (registerRequest.getNicNumber() != null && !registerRequest.getNicNumber().isBlank()) {
            pending.setNicNumber(registerRequest.getNicNumber());
        }

        registrationService.storePendingUser(pending);

        String otp = otpService.generateOtp(email);
        emailService.sendOtpEmail(email, otp);

        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(Map.of("message", "OTP sent to " + email));
    }

    
    
    

    @PostMapping("/verify-register-otp")
    public ResponseEntity<?> verifyRegistrationOtp(@RequestBody VerifyRequest verifyRequest) {
        String normalizedEmail = verifyRequest.getEmail().trim().toLowerCase();
        boolean isValid = otpService.validateOtp(normalizedEmail, verifyRequest.getOtp());

        if (!isValid) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or expired OTP"));
        }

        
        String roleStr = verifyRequest.getRole();
        if (roleStr == null || roleStr.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Role is required for registration verification"));
        }

        Role role;
        try {
            role = Role.valueOf(roleStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid role: " + roleStr));
        }

        User pendingUser = registrationService.getPendingUser(normalizedEmail, role.name());
        if (pendingUser == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "No pending registration found for this email and role"));
        }

        User created;
        try {
            created = userService.registerUser(pendingUser);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", ex.getMessage()));
        }

        registrationService.removePendingUser(normalizedEmail, role.name());

        // Trigger notification to Super Admins
        try {
            notificationService.notifyAdminsOnNewUserRegistration(created);
        } catch (Exception e) {
            System.err.println("Failed to send admin notification: " + e.getMessage());
        }

        String token = jwtService.generateToken(created.getEmail(), created.getRole().name());

        return ResponseEntity.ok(Map.of(
                "message", "Registration verified and user created",
                "token", token,
                "role", created.getRole().name(),
                "id", created.getId()));
    }

    
    
    

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        if (loginRequest.getEmail() == null || loginRequest.getEmail().isBlank() ||
                loginRequest.getPassword() == null || loginRequest.getPassword().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Email and password must be provided"));
        }

        String email = loginRequest.getEmail().trim().toLowerCase();

        
        try {
            userService.loginUser(email, loginRequest.getPassword());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid email or password"));
        }

        List<String> roles = userService.getRolesForEmail(email);

        
        if (roles.contains(Role.SUPER_ADMIN.name())) {
            String otp = otpService.generateOtp(email);
            emailService.sendOtpEmail(email, otp);
            return ResponseEntity.ok(Map.of(
                    "status", "OTP_SENT",
                    "roles", List.of(Role.SUPER_ADMIN.name())));
        }

        
        if (roles.size() == 1) {
            String otp = otpService.generateOtp(email);
            emailService.sendOtpEmail(email, otp);
            return ResponseEntity.ok(Map.of(
                    "status", "OTP_SENT",
                    "roles", roles));
        }

        
        return ResponseEntity.ok(Map.of(
                "status", "ROLE_SELECTION_REQUIRED",
                "roles", roles));
    }

    
    
    

    @PostMapping("/select-role")
    public ResponseEntity<?> selectRole(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String roleStr = body.get("role");

        if (email == null || email.isBlank() || roleStr == null || roleStr.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Email and role are required"));
        }

        email = email.trim().toLowerCase();

        Role role;
        try {
            role = Role.valueOf(roleStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid role: " + roleStr));
        }

        
        List<String> roles = userService.getRolesForEmail(email);
        if (!roles.contains(role.name())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "No account found for this email with role " + role.name()));
        }

        String otp = otpService.generateOtp(email);
        emailService.sendOtpEmail(email, otp);

        return ResponseEntity.ok(Map.of("status", "OTP_SENT"));
    }

    
    
    

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyRequest verifyRequest) {
        String email = verifyRequest.getEmail().trim().toLowerCase();
        boolean isValid = otpService.validateOtp(email, verifyRequest.getOtp());

        if (!isValid) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or expired OTP"));
        }

        
        String roleStr = verifyRequest.getRole();
        User user;

        if (roleStr != null && !roleStr.isBlank()) {
            
            Role role;
            try {
                role = Role.valueOf(roleStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Invalid role: " + roleStr));
            }
            user = userService.getUserByEmailAndRole(email, role);
        } else {
            
            List<User> users = userService.getUsersByEmail(email);
            if (users.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "User not found"));
            }
            user = users.get(0);
        }

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());

        return ResponseEntity.ok(Map.of(
                "message", "Verification successful",
                "token", token,
                "role", user.getRole().name(),
                "id", user.getId()));
    }
}