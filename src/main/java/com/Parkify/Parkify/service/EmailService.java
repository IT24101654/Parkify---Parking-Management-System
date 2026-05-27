package com.Parkify.Parkify.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    @Value("${brevo.api.key}")
    private String brevoApiKey;

    @Value("${brevo.sender.email}")
    private String senderEmail;

    private final RestTemplate restTemplate = new RestTemplate();
    private final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

    private void sendEmailViaBrevo(String to, String subject, String textContent) {
        new Thread(() -> {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.set("accept", "application/json");
                headers.set("api-key", brevoApiKey);
                headers.set("content-type", "application/json");

                Map<String, Object> sender = new HashMap<>();
                sender.put("name", "Parkify");
                sender.put("email", senderEmail);

                Map<String, Object> toRecipient = new HashMap<>();
                toRecipient.put("email", to);

                Map<String, Object> body = new HashMap<>();
                body.put("sender", sender);
                body.put("to", List.of(toRecipient));
                body.put("subject", subject);
                body.put("textContent", textContent);

                HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
                
                ResponseEntity<String> response = restTemplate.exchange(BREVO_API_URL, HttpMethod.POST, request, String.class);
                
                System.out.println("✅ Email sent via Brevo to " + to + ". Status: " + response.getStatusCode());
            } catch (Exception e) {
                System.err.println("❌ Failed to send email via Brevo to " + to + ". Reason: " + e.getMessage());
            }
        }).start();
    }

    public void sendOtpEmail(String to, String otp) {
        String subject = "Parkify - Your OTP Verification Code";
        String text = "Welcome to Parkify!\n\nYour OTP for login is: " + otp +
                "\n\nThis code is valid for 5 minutes. Please do not share this with anyone.";

        System.out.println("==========================================================");
        System.out.println("🚀 [DEBUG] OTP for " + to + " is: " + otp);
        System.out.println("==========================================================");

        sendEmailViaBrevo(to, subject, text);
    }

    public void sendNewUserNotificationEmail(String toAdminEmail, com.Parkify.Parkify.model.User newUser) {
        String subject = "Parkify - New User Registration: " + newUser.getRole().name();
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

        sendEmailViaBrevo(toAdminEmail, subject, text);
    }
}

