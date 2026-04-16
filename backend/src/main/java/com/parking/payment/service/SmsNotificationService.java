package com.parking.payment.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SmsNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(SmsNotificationService.class);

    @Value("${twilio.account.sid}")
    private String accountSid;

    @Value("${twilio.auth.token}")
    private String authToken;

    @Value("${twilio.phone.number}")
    private String fromNumber;

    private boolean twilioEnabled = false;

    @PostConstruct
    public void init() {
        if (!accountSid.startsWith("YOUR_") && !authToken.startsWith("YOUR_")) {
            Twilio.init(accountSid, authToken);
            twilioEnabled = true;
            logger.info("Twilio SMS Service initialized successfully");
        } else {
            logger.warn("Twilio credentials not configured. SMS notifications are disabled.");
        }
    }

    /**
     * Sends an SMS to the given toPhone number.
     * Falls back to console logging if Twilio is not configured or if driver has no phone.
     */
    private void sendSms(String toPhone, String body) {
        if (!twilioEnabled) {
            logger.info("[SMS MOCK → {}] {}", toPhone, body);
            return;
        }
        if (toPhone == null || toPhone.isBlank()) {
            logger.warn("No phone number available for driver. SMS skipped.");
            return;
        }
        try {
            Message.creator(
                new PhoneNumber(toPhone),
                new PhoneNumber(fromNumber),
                body
            ).create();
            logger.info("SMS sent to {}", toPhone);
        } catch (Exception e) {
            logger.error("Failed to send SMS to {}: {}", toPhone, e.getMessage());
        }
    }

    public void sendPaymentConfirmation(String bookingId, String amount, String paymentMethod,
                                        String driverName, String driverPhone) {
        String body = String.format(
            "🚗 Parkify - Payment Confirmed!\nBooking #%s PAID\nDriver: %s\nAmount: Rs. %s via %s\nThank you for using Parkify!",
            bookingId, driverName, amount, paymentMethod
        );
        sendSms(driverPhone, body);
    }

    public void sendCashPaymentPending(String bookingId, String amount,
                                       String driverName, String driverPhone) {
        String body = String.format(
            "🚗 Parkify - Cash Booking\nBooking #%s Reserved!\nDriver: %s\nAmount Due: Rs. %s\nPayment: CASH ON ARRIVAL\nBring exact amount to the parking slot.",
            bookingId, driverName, amount
        );
        sendSms(driverPhone, body);
    }
}
