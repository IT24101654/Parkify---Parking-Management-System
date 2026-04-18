package com.Parkify.Parkify.repository;

import com.Parkify.Parkify.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByDriverIdOrderByCreatedAtDesc(Long driverId);
    List<Reservation> findByParkingPlaceIdInOrderByCreatedAtDesc(List<Long> parkingPlaceIds);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(r) FROM Reservation r WHERE r.parkingPlaceId = :parkingPlaceId AND r.slotNumber = :slotNumber AND r.reservationDate = :date AND r.status NOT IN ('CANCELLED', 'REJECTED', 'REFUNDED') AND r.startTime < :endTime AND r.endTime > :startTime")
    long countOverlappingReservations(
             @org.springframework.data.repository.query.Param("parkingPlaceId") Long parkingPlaceId,
             @org.springframework.data.repository.query.Param("slotNumber") String slotNumber,
             @org.springframework.data.repository.query.Param("date") java.time.LocalDate date,
             @org.springframework.data.repository.query.Param("startTime") String startTime,
             @org.springframework.data.repository.query.Param("endTime") String endTime);
}
