package com.Parkify.Parkify.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.Parkify.Parkify.dto.LoginRequest;
import com.Parkify.Parkify.dto.RegisterRequest;
import com.Parkify.Parkify.dto.VerifyRequest;
import com.Parkify.Parkify.model.Role;
import com.Parkify.Parkify.model.User;
import com.Parkify.Parkify.service.*;

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
        try {
            role = Role.valueOf(registerRequest.getRole().toUpperCase());
        } catch (Exception e) {
            role = Role.DRIVER;
        }

        if (role == Role.SUPER_ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "SUPER_ADMIN cannot be registered publicly"));
        }

        List<String> roles = userService.getRolesForEmail(email);
        if (roles.contains(role.name())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Already registered as " + role));
        }

        User pending = new User();
        pending.setName(registerRequest.getName());
        pending.setEmail(email);
        pending.setPassword(registerRequest.getPassword());
        pending.setPhoneNumber(registerRequest.getPhoneNumber());
        pending.setAddress(registerRequest.getAddress());
        pending.setRole(role);
        
        if (registerRequest.getNicNumber() != null && !registerRequest.getNicNumber().isBlank()) {
            pending.setNicNumber(registerRequest.getNicNumber());
        }

        registrationService.storePendingUser(pending);

        String otp = otpService.generateOtp(email);
        emailService.sendOtpEmail(email, otp);

        return ResponseEntity.ok(Map.of("message", "OTP sent"));
    }

    @PostMapping("/verify-register-otp")
    public ResponseEntity<?> verifyRegistrationOtp(@RequestBody VerifyRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        if (!otpService.validateOtp(email, request.getOtp())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid OTP"));
        }

        Role role = Role.valueOf(request.getRole().toUpperCase());

        User pending = registrationService.getPendingUser(email, role.name());
        User created = userService.registerUser(pending);

        registrationService.removePendingUser(email, role.name());

        notificationService.notifyAdminsOnNewUserRegistration(created);

        String token = jwtService.generateToken(created.getEmail(), created.getRole().name());

        return ResponseEntity.ok(Map.of(
                "token", token,
                "role", created.getRole().name(),
                "id", created.getId()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        userService.loginUser(email, request.getPassword());

        List<String> roles = userService.getRolesForEmail(email);

        if (roles.size() == 1) {
            String otp = otpService.generateOtp(email);
            emailService.sendOtpEmail(email, otp);

            return ResponseEntity.ok(Map.of(
                    "status", "OTP_SENT",
                    "roles", roles
            ));
        }

        return ResponseEntity.ok(Map.of(
                "status", "ROLE_SELECTION_REQUIRED",
                "roles", roles
        ));
    }

    @PostMapping("/select-role")
    public ResponseEntity<?> selectRole(@RequestBody Map<String, String> body) {

        String email = body.get("email").trim().toLowerCase();
        String role = body.get("role");

        String otp = otpService.generateOtp(email);
        emailService.sendOtpEmail(email, otp);

        return ResponseEntity.ok(Map.of("status", "OTP_SENT"));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        if (!otpService.validateOtp(email, request.getOtp())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid OTP"));
        }

        Role role = Role.valueOf(request.getRole().toUpperCase());
        User user = userService.getUserByEmailAndRole(email, role);

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());

        return ResponseEntity.ok(Map.of(
                "token", token,
                "role", user.getRole().name(),
                "id", user.getId()
        ));
    }
}
