package com.parking.payment.repository;

import com.parking.payment.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByDriverIdOrderByCreatedAtDesc(Long driverId);
    List<Booking> findBySlotOwnerIdOrderByCreatedAtDesc(Long ownerId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(b) FROM Booking b WHERE b.slot.id = :slotId " +
            "AND b.status IN :statuses " +
            "AND (b.startTime < :endTime AND b.endTime > :startTime)")
    long countOverlappingBookings(@org.springframework.data.repository.query.Param("slotId") Long slotId, 
                                  @org.springframework.data.repository.query.Param("startTime") java.time.LocalDateTime startTime, 
                                  @org.springframework.data.repository.query.Param("endTime") java.time.LocalDateTime endTime,
                                  @org.springframework.data.repository.query.Param("statuses") java.util.List<com.parking.payment.entity.Booking.BookingStatus> statuses);
}
