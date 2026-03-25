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
        // Aluth OTP eka generate karaganna
        String otpCode = String.valueOf(new Random().nextInt(900000) + 100000);

        // 1. Kalin me email ekata OTP ekak thiyeda kiyala check karanna
        Optional<Otp> existingOtp = otpRepository.findByEmail(email);

        Otp otpEntity;
        if (existingOtp.isPresent()) {
            // 2. Thiyenawa nam e record ekama aran update karanna
            otpEntity = existingOtp.get();
        } else {
            // 3. Nathnam aluth record ekak hadanna
            otpEntity = new Otp();
            otpEntity.setEmail(email);
        }

        // Data set karanna
        otpEntity.setOtp(otpCode);
        otpEntity.setExpiryTime(LocalDateTime.now().plusMinutes(5));

        // Save karanna (Memege update ekak hari insert ekak hari wenawa)
        otpRepository.save(otpEntity);

        return otpCode;
    }

    public boolean validateOtp(String email, String enteredOtp) {
        return otpRepository.findByEmail(email)
                .map(otp -> otp.getOtp().equals(enteredOtp) && otp.getExpiryTime().isAfter(LocalDateTime.now()))
                .orElse(false);
    }
}