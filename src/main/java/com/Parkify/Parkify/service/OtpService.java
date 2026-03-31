package com.Parkify.Parkify.service;

import com.Parkify.Parkify.model.Otp;
import com.Parkify.Parkify.repository.OtpRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class OtpService {

    @Autowired
    private OtpRepository otpRepository;

    @Transactional
    public String generateOtp(String email) {
        String otp = String.valueOf(new Random().nextInt(900000) + 100000);

        // Try to find existing OTP for this email
        Optional<Otp> existingOtp = otpRepository.findByEmail(email);

        if (existingOtp.isPresent()) {
            // Update existing OTP
            Otp otpEntity = existingOtp.get();
            otpEntity.setOtp(otp);
            otpEntity.setExpiryTime(LocalDateTime.now().plusMinutes(5));
            otpRepository.save(otpEntity);
        } else {
            // Create new OTP
            Otp otpEntity = new Otp();
            otpEntity.setEmail(email);
            otpEntity.setOtp(otp);
            otpEntity.setExpiryTime(LocalDateTime.now().plusMinutes(5));
            otpRepository.save(otpEntity);
        }

        return otp;
    }

    public boolean validateOtp(String email, String enteredOtp) {
        return otpRepository.findByEmail(email)
                .map(otp -> otp.getOtp().equals(enteredOtp) && otp.getExpiryTime().isAfter(LocalDateTime.now()))
                .orElse(false);
    }
}