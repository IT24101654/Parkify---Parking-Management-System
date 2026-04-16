package com.parking.payment.repository;

import com.parking.payment.entity.Payout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PayoutRepository extends JpaRepository<Payout, Long> {
    List<Payout> findByOwnerId(Long ownerId);
    List<Payout> findByStatus(Payout.PayoutStatus status);
}
