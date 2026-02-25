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
        
        String otpCode = String.valueOf(new Random().nextInt(900000) + 100000);
        Optional<Otp> existingOtp = otpRepository.findByEmail(email);

        Otp otpEntity;
        if (existingOtp.isPresent()) {
            
            otpEntity = existingOtp.get();
        } else {
            otpEntity = new Otp();
            otpEntity.setEmail(email);
        }
        otpEntity.setOtp(otpCode);
        otpEntity.setExpiryTime(LocalDateTime.now().plusMinutes(5));


        otpRepository.save(otpEntity);

        return otpCode;
    }

    public boolean validateOtp(String email, String enteredOtp) {
        return otpRepository.findByEmail(email)
                .map(otp -> otp.getOtp().equals(enteredOtp) && otp.getExpiryTime().isAfter(LocalDateTime.now()))
                .orElse(false);
    }
}