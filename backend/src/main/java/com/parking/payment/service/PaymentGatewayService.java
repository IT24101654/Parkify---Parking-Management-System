package com.parking.payment.service;

import java.math.BigDecimal;

public interface PaymentGatewayService {
    String initiatePaymentIntent(BigDecimal amount, String currency, String referenceId);
    boolean verifyTransaction(String transactionId);
    boolean processRefund(String transactionId, BigDecimal amount);
}
