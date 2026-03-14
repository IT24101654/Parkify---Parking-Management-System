package com.Parkify.Parkify.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOtpEmail(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Parkify - Your OTP Verification Code");
        message.setText("Welcome to Parkify!\n\nYour OTP for login is: " + otp +
                "\n\nThis code is valid for 5 minutes. Please do not share this with anyone.");

        mailSender.send(message);
    }
}