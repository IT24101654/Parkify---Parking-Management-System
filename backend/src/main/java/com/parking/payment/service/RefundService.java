package com.parking.payment.service;

import com.parking.payment.entity.AuditLog;
import com.parking.payment.entity.Payment;
import com.parking.payment.entity.RefundRequest;
import com.parking.payment.entity.User;
import com.parking.payment.repository.PaymentRepository;
import com.parking.payment.repository.RefundRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RefundService {

    @Autowired
    private RefundRequestRepository refundRequestRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Transactional
    public RefundRequest submitRefund(Long paymentId, String reason, User driver) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (!payment.getDriver().getId().equals(driver.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        if (payment.getStatus() != Payment.PaymentStatus.PAID) {
            throw new RuntimeException("Cannot refund a payment that is not PAID");
        }

        List<RefundRequest> existingRequests = refundRequestRepository.findByPaymentId(paymentId);
        for (RefundRequest req : existingRequests) {
            if (req.getStatus() == RefundRequest.RefundStatus.REQUESTED || req.getStatus() == RefundRequest.RefundStatus.UNDER_REVIEW) {
                throw new RuntimeException("A refund request is already pending for this payment.");
            }
        }

        RefundRequest request = new RefundRequest();
        request.setPayment(payment);
        request.setReason(reason);
        request.setStatus(RefundRequest.RefundStatus.REQUESTED);
        request.setIsPartial(false);
        request.setAmountRefunded(payment.getAmount()); // Strict bounds: exactly full amount in this model

        auditLogService.logAction("REFUND_SUBMITTED", "Driver requested refund for Payment " + paymentId, driver);

        return refundRequestRepository.save(request);
    }

    public List<RefundRequest> getPendingRefunds() {
        return refundRequestRepository.findByStatus(RefundRequest.RefundStatus.REQUESTED);
    }

    @Transactional
    public RefundRequest processRefund(Long refundId, boolean approve, User admin) {
        RefundRequest request = refundRequestRepository.findById(refundId)
                .orElseThrow(() -> new RuntimeException("Refund request not found"));

        if (approve) {
            request.setStatus(RefundRequest.RefundStatus.PROCESSED);
            Payment payment = request.getPayment();
            payment.setStatus(Payment.PaymentStatus.REFUNDED);
            paymentRepository.save(payment);
            auditLogService.logAction("REFUND_APPROVED", "Admin approved refund " + refundId, admin);
        } else {
            request.setStatus(RefundRequest.RefundStatus.REJECTED);
            auditLogService.logAction("REFUND_REJECTED", "Admin rejected refund " + refundId, admin);
        }

        request.setProcessedBy(admin);
        return refundRequestRepository.save(request);
    }
}
