package com.Parkify.Parkify.controller;

import com.Parkify.Parkify.dto.LoginRequest;
import com.Parkify.Parkify.dto.RegisterRequest;
import com.Parkify.Parkify.dto.VerifyRequest;
import com.Parkify.Parkify.model.User;
import com.Parkify.Parkify.service.EmailService;
import com.Parkify.Parkify.service.JwtService;
import com.Parkify.Parkify.service.OtpService;
import com.Parkify.Parkify.service.RegistrationService;
import com.Parkify.Parkify.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private OtpService otpService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserService userService;

    @Autowired
    private RegistrationService registrationService;

    @PostMapping("/register-otp")
    public ResponseEntity<?> sendOtpForRegistration(@RequestBody RegisterRequest registerRequest) {
        String email = registerRequest.getEmail().trim().toLowerCase();

        if (userService.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Email already registered"));
        }

        User pending = new User();
        pending.setName(registerRequest.getName());
        pending.setEmail(email);
        pending.setPassword(registerRequest.getPassword());
        pending.setPhoneNumber(registerRequest.getPhoneNumber());
        pending.setAddress(registerRequest.getAddress());
        pending.setHasInventory(registerRequest.isHasInventory());
        pending.setHasServiceCenter(registerRequest.isHasServiceCenter());
        if (registerRequest.getRole() != null && !registerRequest.getRole().isBlank()) {
            try {
                pending.setRole(com.Parkify.Parkify.model.Role.valueOf(registerRequest.getRole().toUpperCase()));
            } catch (IllegalArgumentException ex) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Invalid role, must be DRIVER or PARKING_OWNER or SUPER_ADMIN"));
            }
        } else {
            pending.setRole(null); 
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

        User pendingUser = registrationService.getPendingUser(normalizedEmail);
        if (pendingUser == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "No pending registration found for this email"));
        }

        User created;
        try {
            created = userService.registerUser(pendingUser);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", ex.getMessage()));
        }

        registrationService.removePendingUser(verifyRequest.getEmail());

        String token = jwtService.generateToken(created.getEmail(), created.getRole().name());

        return ResponseEntity.ok(Map.of(
                "message", "Registration verified and user created",
                "token", token,
                "role", created.getRole().name(),
                "id", created.getId()
        ));
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
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid email or password"));
        }

        String otp = otpService.generateOtp(email);
        emailService.sendOtpEmail(email, otp);
        return ResponseEntity.ok(Map.of("message", "OTP sent to " + email));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyRequest verifyRequest) {
        String email = verifyRequest.getEmail().trim().toLowerCase();
        boolean isValid = otpService.validateOtp(email, verifyRequest.getOtp());

        if (isValid) {
            User user = userService.getUserByEmail(email);
            String token = jwtService.generateToken(user.getEmail(), user.getRole().name());

            return ResponseEntity.ok(Map.of(
                    "message", "Verification successful",
                    "token", token,
                    "role", user.getRole().name(),
                    "id", user.getId()
            ));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or expired OTP"));
        }
    }
}