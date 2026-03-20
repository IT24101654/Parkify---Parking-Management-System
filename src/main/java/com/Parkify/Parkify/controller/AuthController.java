package com.Parkify.Parkify.controller;

import com.Parkify.Parkify.dto.LoginRequest;
import com.Parkify.Parkify.dto.VerifyRequest;
import com.Parkify.Parkify.model.User;
import com.Parkify.Parkify.service.EmailService;
import com.Parkify.Parkify.service.JwtService;
import com.Parkify.Parkify.service.OtpService;
import com.Parkify.Parkify.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

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

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            userService.loginUser(loginRequest.getEmail(), loginRequest.getPassword());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid email or password"));
        }

        String otp = otpService.generateOtp(loginRequest.getEmail());
        emailService.sendOtpEmail(loginRequest.getEmail(), otp);
        return ResponseEntity.ok(Map.of("message", "OTP sent to " + loginRequest.getEmail()));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyRequest verifyRequest) {
        boolean isValid = otpService.validateOtp(verifyRequest.getEmail(), verifyRequest.getOtp());

        if (isValid) {
            User user = userService.getUserByEmail(verifyRequest.getEmail());
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