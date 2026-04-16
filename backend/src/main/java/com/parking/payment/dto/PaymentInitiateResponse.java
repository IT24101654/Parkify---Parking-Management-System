package com.parking.payment.dto;

public class PaymentInitiateResponse {
    private String checkoutUrl;
    private Long paymentId;

    public PaymentInitiateResponse() {}

    public PaymentInitiateResponse(String checkoutUrl, Long paymentId) {
        this.checkoutUrl = checkoutUrl;
        this.paymentId = paymentId;
    }

    public String getCheckoutUrl() {
        return checkoutUrl;
    }

    public void setCheckoutUrl(String checkoutUrl) {
        this.checkoutUrl = checkoutUrl;
    }

    public Long getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(Long paymentId) {
        this.paymentId = paymentId;
    }
}
