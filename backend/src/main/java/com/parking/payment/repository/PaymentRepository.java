package com.parking.payment.repository;

import com.parking.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByGatewayTransactionId(String gatewayTransactionId);
    Optional<Payment> findByBookingId(Long bookingId);
    List<Payment> findByDriverIdOrderByCreatedAtDesc(Long driverId);
    List<Payment> findByBookingSlotOwnerIdOrderByCreatedAtDesc(Long ownerId);
    List<Payment> findByBookingSlotOwnerIdAndStatusAndIsSettledFalse(Long ownerId, Payment.PaymentStatus status);
    List<Payment> findByStatusAndCreatedAtBefore(Payment.PaymentStatus status, java.time.LocalDateTime time);
}
