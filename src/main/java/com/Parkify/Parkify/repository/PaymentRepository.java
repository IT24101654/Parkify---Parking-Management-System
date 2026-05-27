package com.Parkify.Parkify.repository;

import com.Parkify.Parkify.model.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends MongoRepository<Payment, Long> {

    Optional<Payment> findByGatewayTransactionId(String gatewayTransactionId);
    
    Optional<Payment> findByReservationId(Long reservationId);
    
    // We will handle filtering in the controller/service layer because MongoDB doesn't support joins across DBRefs in derived queries.
    List<Payment> findByStatus(String status);
    List<Payment> findByStatusNot(String status);
}


