package com.Parkify.Parkify.repository;

import com.Parkify.Parkify.model.ServiceAppointment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface ServiceAppointmentRepository extends JpaRepository<ServiceAppointment, Long> {

    Optional<ServiceAppointment> findByBookingId(String bookingId);

    boolean existsByServiceCenterAndServiceDateAndTimeSlotAndStatus(
            String serviceCenter, LocalDate serviceDate, String timeSlot, String status);

    boolean existsByServiceCenterAndServiceDateAndTimeSlotAndStatusAndBookingIdNot(
            String serviceCenter, LocalDate serviceDate, String timeSlot, String status, String bookingId);

    long countByStatus(String status);

    @Query("""
                SELECT a FROM ServiceAppointment a
                WHERE (:bookingId IS NULL OR LOWER(a.bookingId) LIKE LOWER(CONCAT('%', :bookingId, '%')))
                  AND (:customerName IS NULL OR LOWER(a.customerName) LIKE LOWER(CONCAT('%', :customerName, '%')))
                  AND (:vehicleId IS NULL OR LOWER(a.vehicleId) LIKE LOWER(CONCAT('%', :vehicleId, '%')))
                  AND (:status IS NULL OR a.status = :status)
                  AND (:dateFrom IS NULL OR a.serviceDate >= :dateFrom)
                  AND (:dateTo IS NULL OR a.serviceDate <= :dateTo)
                  AND (:driverId IS NULL OR a.driverId = :driverId)
                  AND (:serviceCenter IS NULL OR a.serviceCenter = :serviceCenter)
                ORDER BY a.createdAt DESC
            """)
    Page<ServiceAppointment> searchAppointments(
            @Param("bookingId") String bookingId,
            @Param("customerName") String customerName,
            @Param("vehicleId") String vehicleId,
            @Param("status") String status,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo,
            @Param("driverId") Long driverId,
            @Param("serviceCenter") String serviceCenter,
            Pageable pageable);

    @Query("SELECT MAX(a.id) FROM ServiceAppointment a")
    Long findMaxId();
}
