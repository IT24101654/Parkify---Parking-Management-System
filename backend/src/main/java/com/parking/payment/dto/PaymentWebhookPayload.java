package com.parking.payment.dto;

public class PaymentWebhookPayload {
    private String gatewayTransactionId;
    private String status; 

    public String getGatewayTransactionId() { return gatewayTransactionId; }
    public void setGatewayTransactionId(String gatewayTransactionId) { this.gatewayTransactionId = gatewayTransactionId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
