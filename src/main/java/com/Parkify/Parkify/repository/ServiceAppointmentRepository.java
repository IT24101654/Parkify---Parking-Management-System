package com.Parkify.Parkify.repository;

import com.Parkify.Parkify.model.ServiceAppointment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface ServiceAppointmentRepository extends MongoRepository<ServiceAppointment, Long> {

    Optional<ServiceAppointment> findByBookingId(String bookingId);

    boolean existsByServiceCenterAndServiceDateAndTimeSlotAndStatus(
            String serviceCenter, LocalDate serviceDate, String timeSlot, String status);

    boolean existsByServiceCenterAndServiceDateAndTimeSlotAndStatusAndBookingIdNot(
            String serviceCenter, LocalDate serviceDate, String timeSlot, String status, String bookingId);

    long countByStatus(String status);

    @Query("{ $and: [ " +
           " { $or: [ { $expr: { $eq: [ '?0', 'null' ] } }, { 'bookingId': { $regex: '?0', $options: 'i' } } ] }, " +
           " { $or: [ { $expr: { $eq: [ '?1', 'null' ] } }, { 'customerName': { $regex: '?1', $options: 'i' } } ] }, " +
           " { $or: [ { $expr: { $eq: [ '?2', 'null' ] } }, { 'vehicleId': { $regex: '?2', $options: 'i' } } ] }, " +
           " { $or: [ { $expr: { $eq: [ '?3', 'null' ] } }, { 'status': '?3' } ] }, " +
           " { $or: [ { $expr: { $eq: [ '?4', 'null' ] } }, { 'serviceDate': { $gte: ?4 } } ] }, " +
           " { $or: [ { $expr: { $eq: [ '?5', 'null' ] } }, { 'serviceDate': { $lte: ?5 } } ] }, " +
           " { $or: [ { $expr: { $eq: [ '?6', 'null' ] } }, { 'driverId': ?6 } ] }, " +
           " { $or: [ { $expr: { $eq: [ '?7', 'null' ] } }, { 'serviceCenter': '?7' } ] } " +
           "] }")
    Page<ServiceAppointment> searchAppointments(
            String bookingId,
            String customerName,
            String vehicleId,
            String status,
            LocalDate dateFrom,
            LocalDate dateTo,
            Long driverId,
            String serviceCenter,
            Pageable pageable);
    Optional<ServiceAppointment> findTopByOrderByIdDesc();

}


