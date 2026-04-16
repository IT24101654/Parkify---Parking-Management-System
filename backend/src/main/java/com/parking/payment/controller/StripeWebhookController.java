package com.parking.payment.controller;

import com.parking.payment.dto.PaymentWebhookPayload;
import com.parking.payment.service.PaymentService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/webhooks/stripe")
public class StripeWebhookController {

    private static final Logger logger = LoggerFactory.getLogger(StripeWebhookController.class);

    @Value("${stripe.webhook.secret}")
    private String endpointSecret;

    @Autowired
    private PaymentService paymentService;

    @PostMapping
    public ResponseEntity<String> handleStripeEvent(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        
        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
        } catch (SignatureVerificationException e) {
            logger.error("Invalid Stripe Signature", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Signature Verification Failed");
        } catch (Exception e) {
            logger.error("Error creating Webhook Event", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid Payload");
        }

        switch (event.getType()) {
            case "checkout.session.completed":
                Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
                if (session != null) {
                    processFulfillment(session);
                }
                break;
            case "checkout.session.expired":
                Session expiredSession = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
                if (expiredSession != null) {
                    processExpiration(expiredSession);
                }
                break;
                // Add more cases here as needed...
            default:
                logger.info("Unhandled Stripe event type: {}", event.getType());
        }

        return ResponseEntity.ok("Success");
    }

    private void processFulfillment(Session session) {
        logger.info("Fulfilling Stripe checkout session: {}", session.getId());
        PaymentWebhookPayload internalPayload = new PaymentWebhookPayload();
        internalPayload.setGatewayTransactionId(session.getId());
        // Map successful status
        internalPayload.setStatus("SUCCESS");
        
        paymentService.processWebhook(internalPayload);
    }

    private void processExpiration(Session session) {
        logger.info("Expiring Stripe checkout session: {}", session.getId());
        PaymentWebhookPayload internalPayload = new PaymentWebhookPayload();
        internalPayload.setGatewayTransactionId(session.getId());
        internalPayload.setStatus("FAILED");
        
        paymentService.processWebhook(internalPayload);
    }
}
