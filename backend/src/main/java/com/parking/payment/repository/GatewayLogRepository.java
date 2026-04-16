package com.parking.payment.repository;

import com.parking.payment.entity.GatewayLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GatewayLogRepository extends JpaRepository<GatewayLog, Long> {
    Optional<GatewayLog> findByTransactionId(String transactionId);
}
