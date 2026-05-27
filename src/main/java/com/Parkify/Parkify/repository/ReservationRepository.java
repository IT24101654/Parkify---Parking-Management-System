package com.Parkify.Parkify.repository;

import com.Parkify.Parkify.model.Reservation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReservationRepository extends MongoRepository<Reservation, Long> {
    List<Reservation> findByDriverIdOrderByCreatedAtDesc(Long driverId);
    List<Reservation> findByParkingPlaceIdInOrderByCreatedAtDesc(List<Long> parkingPlaceIds);

    @org.springframework.data.mongodb.repository.Query(value = "{ 'parkingPlaceId': ?0, 'slotNumber': ?1, 'reservationDate': ?2, 'status': { $nin: ['CANCELLED', 'REJECTED', 'REFUNDED'] }, 'startTime': { $lt: ?4 }, 'endTime': { $gt: ?3 } }", count = true)
    long countOverlappingReservations(
             Long parkingPlaceId,
             String slotNumber,
             java.time.LocalDate date,
             String startTime,
             String endTime);
}


