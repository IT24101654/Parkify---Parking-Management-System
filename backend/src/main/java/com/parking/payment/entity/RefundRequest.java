package com.parking.payment.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "refund_requests")
public class RefundRequest {

    public enum RefundStatus {
        REQUESTED, UNDER_REVIEW, APPROVED, REJECTED, PROCESSED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id", nullable = false)
    private Payment payment;

    @Column(nullable = false, length = 500)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RefundStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by")
    private User processedBy;

    @Column(nullable = false)
    private boolean isPartial = false;

    @Column(precision = 10, scale = 2)
    private java.math.BigDecimal amountRefunded;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    public RefundRequest() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Payment getPayment() { return payment; }
    public void setPayment(Payment payment) { this.payment = payment; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public RefundStatus getStatus() { return status; }
    public void setStatus(RefundStatus status) { this.status = status; }
    public User getProcessedBy() { return processedBy; }
    public void setProcessedBy(User processedBy) { this.processedBy = processedBy; }
    public boolean getIsPartial() { return isPartial; }
    public void setIsPartial(boolean isPartial) { this.isPartial = isPartial; }
    public java.math.BigDecimal getAmountRefunded() { return amountRefunded; }
    public void setAmountRefunded(java.math.BigDecimal amountRefunded) { this.amountRefunded = amountRefunded; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
