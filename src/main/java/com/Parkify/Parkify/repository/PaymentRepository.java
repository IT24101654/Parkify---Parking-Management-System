package com.Parkify.Parkify.repository;

import com.Parkify.Parkify.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByGatewayTransactionId(String gatewayTransactionId);
    
    Optional<Payment> findByReservationId(Long reservationId);
    
    // Custom query to fetch all non-pending payments for an owner's parking places
    @org.springframework.data.jpa.repository.Query("SELECT p FROM Payment p JOIN p.reservation r WHERE r.parkingPlaceId IN (SELECT pp.id FROM ParkingPlace pp WHERE pp.ownerId = :ownerId) AND p.status != 'PENDING'")
    List<Payment> findPaymentsByOwnerId(@org.springframework.data.repository.query.Param("ownerId") Long ownerId);

    // Custom query to fetch pending refund requests for an owner's parking places
    @org.springframework.data.jpa.repository.Query("SELECT p FROM Payment p JOIN p.reservation r WHERE r.parkingPlaceId IN (SELECT pp.id FROM ParkingPlace pp WHERE pp.ownerId = :ownerId) AND p.status = :status")
    List<Payment> findPaymentsByOwnerIdAndStatus(@org.springframework.data.repository.query.Param("ownerId") Long ownerId, @org.springframework.data.repository.query.Param("status") String status);
}
