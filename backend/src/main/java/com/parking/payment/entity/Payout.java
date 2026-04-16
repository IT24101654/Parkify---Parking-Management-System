package com.parking.payment.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payouts")
public class Payout {

    public enum PayoutStatus {
        PENDING, PROCESSING, PAID_OUT, FAILED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalEarnings;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal platformFee;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal netPayout;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PayoutStatus status;

    @Column(unique = true)
    private String transferReferenceId;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime paidAt;

    public Payout() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }
    public BigDecimal getTotalEarnings() { return totalEarnings; }
    public void setTotalEarnings(BigDecimal totalEarnings) { this.totalEarnings = totalEarnings; }
    public BigDecimal getPlatformFee() { return platformFee; }
    public void setPlatformFee(BigDecimal platformFee) { this.platformFee = platformFee; }
    public BigDecimal getNetPayout() { return netPayout; }
    public void setNetPayout(BigDecimal netPayout) { this.netPayout = netPayout; }
    public PayoutStatus getStatus() { return status; }
    public void setStatus(PayoutStatus status) { this.status = status; }
    public String getTransferReferenceId() { return transferReferenceId; }
    public void setTransferReferenceId(String transferReferenceId) { this.transferReferenceId = transferReferenceId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }
}
