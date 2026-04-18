package com.Parkify.Parkify.dto;

import lombok.Data;

@Data
public class PaymentWebhookPayload {
    private String gatewayTransactionId;
    private String status;
}
