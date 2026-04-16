package com.parking.payment.repository;

import com.parking.payment.entity.RefundRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface RefundRequestRepository extends JpaRepository<RefundRequest, Long> {
    List<RefundRequest> findByPaymentBookingSlotOwnerIdOrderByCreatedAtDesc(Long ownerId);
    List<RefundRequest> findByPaymentDriverIdOrderByCreatedAtDesc(Long driverId);
    List<RefundRequest> findByStatus(RefundRequest.RefundStatus status);
    List<RefundRequest> findByPaymentId(Long paymentId);
}
