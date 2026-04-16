package com.parking.payment.service;

import com.parking.payment.dto.BookingRequest;
import com.parking.payment.entity.Booking;
import com.parking.payment.entity.ParkingSlot;
import com.parking.payment.entity.User;
import com.parking.payment.repository.BookingRepository;
import com.parking.payment.repository.ParkingSlotRepository;
import com.parking.payment.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.List;

@Service
public class ParkingService {

    @Autowired
    private ParkingSlotRepository slotRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    public List<ParkingSlot> getAllSlots() {
        return slotRepository.findAll();
    }

    public List<ParkingSlot> getSlotsByOwner(Long ownerId) {
        return slotRepository.findByOwnerId(ownerId);
    }

    public List<Booking> getBookingsByDriver(Long driverId) {
        return bookingRepository.findByDriverIdOrderByCreatedAtDesc(driverId);
    }

    public List<Booking> getBookingsByOwner(Long ownerId) {
        return bookingRepository.findBySlotOwnerIdOrderByCreatedAtDesc(ownerId);
    }

    @Transactional
    public Booking createBooking(Long driverId, BookingRequest request) {
        User driver = userRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));
        
        ParkingSlot slot = slotRepository.findById(request.getSlotId())
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        if (!slot.getIsActive()) {
            throw new RuntimeException("Slot is not currently active");
        }

        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new RuntimeException("End time must realistically occur after the Start time.");
        }

        long overlapCount = bookingRepository.countOverlappingBookings(
                slot.getId(), request.getStartTime(), request.getEndTime(), 
                java.util.Arrays.asList(Booking.BookingStatus.ACTIVE, Booking.BookingStatus.PENDING));
                
        if (overlapCount > 0) {
            throw new RuntimeException("This parking slot is already reserved for the selected timeframe. Please pick another time.");
        }

        // Calculate hours
        long hours = Duration.between(request.getStartTime(), request.getEndTime()).toHours();
        if (hours <= 0) hours = 1; // Minimum 1 hour charge
        
        BigDecimal totalAmount = slot.getHourlyRate().multiply(BigDecimal.valueOf(hours));

        Booking booking = new Booking();
        booking.setDriver(driver);
        booking.setSlot(slot);
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setTotalAmount(totalAmount);
        booking.setStatus(Booking.BookingStatus.PENDING);

        return bookingRepository.save(booking);
    }
}
