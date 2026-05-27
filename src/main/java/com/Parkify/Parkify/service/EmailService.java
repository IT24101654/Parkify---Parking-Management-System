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

        // Print OTP to console (useful since Render Free Tier blocks outbound SMTP)
        System.out.println("==========================================================");
        System.out.println("🚀 [DEBUG] OTP for " + to + " is: " + otp);
        System.out.println("==========================================================");

        // Run email sending in a background thread to prevent blocking the API request
        new Thread(() -> {
            try {
                mailSender.send(message);
            } catch (Exception e) {
                System.err.println("❌ Failed to send email to " + to + ". Reason: " + e.getMessage());
            }
        }).start();
    }
    public void sendNewUserNotificationEmail(String toAdminEmail, com.Parkify.Parkify.model.User newUser) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toAdminEmail);
        message.setSubject("Parkify - New User Registration: " + newUser.getRole().name());
        
        String text = String.format(
            "Hello Super Admin,\n\n" +
            "A new user has registered in the Parkify system.\n\n" +
            "Details:\n" +
            "- Name: %s\n" +
            "- Email: %s\n" +
            "- Phone Number: %s\n" +
            "- Role: %s\n\n" +
            "Please log in to the admin dashboard for more details.\n\n" +
            "Regards,\nParkify System",
            newUser.getName(),
            newUser.getEmail(),
            newUser.getPhoneNumber(),
            newUser.getRole().name()
        );

        message.setText(text);
        
        new Thread(() -> {
            try {
                mailSender.send(message);
            } catch (Exception e) {
                System.err.println("❌ Failed to send new user notification email. Reason: " + e.getMessage());
            }
        }).start();
    }
}

