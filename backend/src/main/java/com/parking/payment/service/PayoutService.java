package com.parking.payment.service;

import com.parking.payment.entity.Payment;
import com.parking.payment.entity.Payout;
import com.parking.payment.entity.User;
import com.parking.payment.repository.PaymentRepository;
import com.parking.payment.repository.PayoutRepository;
import com.parking.payment.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class PayoutService {

    @Autowired
    private PayoutRepository payoutRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogService auditLogService;

    private static final BigDecimal PLATFORM_FEE_PERCENTAGE = new BigDecimal("0.15"); // 15% platform fee

    @Transactional
    public Payout processPayoutForOwner(Long ownerId, User admin) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        List<Payment> unsettledPayments = paymentRepository
                .findByBookingSlotOwnerIdAndStatusAndIsSettledFalse(ownerId, Payment.PaymentStatus.PAID);

        if (unsettledPayments.isEmpty()) {
            throw new RuntimeException("No settled payments available for payout");
        }

        BigDecimal totalEarnings = BigDecimal.ZERO;
        for (Payment payment : unsettledPayments) {
            totalEarnings = totalEarnings.add(payment.getAmount());
            payment.setIsSettled(true);
            paymentRepository.save(payment);
        }

        BigDecimal platformFee = totalEarnings.multiply(PLATFORM_FEE_PERCENTAGE)
                .setScale(2, java.math.RoundingMode.HALF_UP);
        BigDecimal netPayout = totalEarnings.subtract(platformFee);

        Payout payout = new Payout();
        payout.setOwner(owner);
        payout.setTotalEarnings(totalEarnings);
        payout.setPlatformFee(platformFee);
        payout.setNetPayout(netPayout);
        payout.setStatus(Payout.PayoutStatus.PAID_OUT);
        payout.setTransferReferenceId("TRF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        payout.setPaidAt(java.time.LocalDateTime.now());

        payout = payoutRepository.save(payout);

        auditLogService.logAction("PAYOUT_PROCESSED", 
                "Admin " + admin.getEmail() + " processed payout for owner " + owner.getEmail() + " Amount: " + netPayout, 
                admin);

        return payout;
    }

    public List<Payout> getPayoutsForOwner(Long ownerId) {
        return payoutRepository.findByOwnerId(ownerId);
    }
}
