package com.Parkify.Parkify.serviceImpl;

import com.Parkify.Parkify.model.ParkingPlace;
import com.Parkify.Parkify.model.Reservation;
import com.Parkify.Parkify.repository.ParkingRepository;
import com.Parkify.Parkify.repository.ReservationRepository;
import com.Parkify.Parkify.service.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ReservationServiceImpl implements ReservationService {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private ParkingRepository parkingRepository;

    /** Calculate duration in hours between two HH:mm time strings */
    private double calculateDuration(String startTime, String endTime) {
        try {
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("HH:mm");
            LocalTime start = LocalTime.parse(startTime, fmt);
            LocalTime end   = LocalTime.parse(endTime,   fmt);
            int seconds = end.toSecondOfDay() - start.toSecondOfDay();
            if (seconds < 0) seconds += 24 * 3600; // overnight
            return Math.round((seconds / 3600.0) * 100.0) / 100.0;
        } catch (Exception e) {
            return 0.0;
        }
    }

    @Override
    public synchronized Reservation bookParking(Long driverId, Map<String, Object> bookingData) {
        Long parkingPlaceId = Long.valueOf(bookingData.get("parkingPlaceId").toString());

        ParkingPlace place = parkingRepository.findById(parkingPlaceId)
                .orElseThrow(() -> new RuntimeException("Parking place not found: " + parkingPlaceId));

        String startTime = bookingData.getOrDefault("startTime", "").toString();
        String endTime   = bookingData.getOrDefault("endTime",   "").toString();

        double duration    = calculateDuration(startTime, endTime);
        double pricePerHour = 0.0;
        try {
            // getPrice() may be primitive double or boxed Double — handle both safely
            Object priceObj = place.getPrice();
            if (priceObj != null) {
                pricePerHour = ((Number) priceObj).doubleValue();
            }
        } catch (Exception ignored) {
            pricePerHour = 0.0;
        }
        double totalAmount  = Math.round(duration * pricePerHour * 100.0) / 100.0;

        String dateStr = bookingData.getOrDefault("reservationDate", "").toString();
        LocalDate reservationDate = null;
        if (!dateStr.isEmpty()) {
            try { reservationDate = LocalDate.parse(dateStr); } catch (Exception ignored) {}
        }
        String slotNumber = bookingData.getOrDefault("slotNumber", "").toString();

        if (reservationDate != null && !startTime.isEmpty() && !endTime.isEmpty() && !slotNumber.isEmpty()) {
            long overlaps = reservationRepository.countOverlappingReservations(
                    parkingPlaceId, slotNumber, reservationDate, startTime, endTime);
            if (overlaps > 0) {
                throw new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.CONFLICT,
                        "The selected slot is already booked for this time period.");
            }
        }

        Reservation reservation = new Reservation();
        reservation.setDriverId(driverId);
        reservation.setDriverName(bookingData.getOrDefault("driverName", "").toString());
        reservation.setParkingPlaceId(parkingPlaceId);
        reservation.setSlotNumber(bookingData.getOrDefault("slotNumber", "").toString());
        reservation.setVehicleNumber(bookingData.getOrDefault("vehicleNumber", "").toString());
        reservation.setVehicleType(bookingData.getOrDefault("vehicleType", "Car").toString());
        reservation.setStartTime(startTime);
        reservation.setEndTime(endTime);
        reservation.setDuration(duration);
        reservation.setTotalAmount(totalAmount);
        reservation.setPaymentStatus(bookingData.getOrDefault("paymentStatus", "PENDING").toString());
        reservation.setStatus(bookingData.getOrDefault("status", "PENDING").toString());
        reservation.setParkingName(place.getParkingName());
        reservation.setParkingLocation(place.getLocation());
        reservation.setPricePerHour(pricePerHour);

        // Parse reservation date
        if (reservationDate != null) {
            reservation.setReservationDate(reservationDate);
        }

        // Optional slotId
        if (bookingData.containsKey("slotId") && bookingData.get("slotId") != null) {
            try { reservation.setSlotId(Long.valueOf(bookingData.get("slotId").toString())); } catch (Exception ignored) {}
        }

        return reservationRepository.save(reservation);
    }

    @Override
    public List<Reservation> getMyReservations(Long driverId) {
        return reservationRepository.findByDriverIdOrderByCreatedAtDesc(driverId);
    }

    @Override
    public Reservation cancelReservation(Long reservationId, Long driverId) {
        Reservation r = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found."));
        if (!r.getDriverId().equals(driverId))
            throw new RuntimeException("Unauthorized.");

        r.setStatus("CANCELLED");

        // Restore slot count on the parking place
        Optional<ParkingPlace> placeOpt = parkingRepository.findById(r.getParkingPlaceId());
        placeOpt.ifPresent(place -> {
            place.setSlots(place.getSlots() + 1);
            parkingRepository.save(place);
        });

        return reservationRepository.save(r);
    }

    @Override
    public Reservation updateReservation(Long id, Long driverId, Map<String, Object> data) {
        Reservation r = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found."));
        if (!r.getDriverId().equals(driverId))
            throw new RuntimeException("Unauthorized.");

        if (data.containsKey("vehicleNumber"))  r.setVehicleNumber(data.get("vehicleNumber").toString());
        if (data.containsKey("vehicleType"))    r.setVehicleType(data.get("vehicleType").toString());
        if (data.containsKey("slotNumber"))     r.setSlotNumber(data.get("slotNumber").toString());
        if (data.containsKey("paymentStatus"))  r.setPaymentStatus(data.get("paymentStatus").toString());
        if (data.containsKey("status"))         r.setStatus(data.get("status").toString());
        if (data.containsKey("startTime"))      r.setStartTime(data.get("startTime").toString());
        if (data.containsKey("endTime"))        r.setEndTime(data.get("endTime").toString());

        // Recalculate duration & total when times change
        if (r.getStartTime() != null && r.getEndTime() != null) {
            double dur = calculateDuration(r.getStartTime(), r.getEndTime());
            r.setDuration(dur);
            Double pph = r.getPricePerHour();
            if (pph != null) {
                r.setTotalAmount(Math.round(dur * pph * 100.0) / 100.0);
            }
        }

        return reservationRepository.save(r);
    }

    @Override
    public Reservation getReservationById(Long id, Long driverId) {
        Reservation r = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found."));
        if (!r.getDriverId().equals(driverId))
            throw new RuntimeException("Unauthorized.");
        return r;
    }

    @Override
    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }

    @Override
    public List<Reservation> getReservationsForOwner(Long ownerId) {
        // 1. Get all parking places for this owner
        List<ParkingPlace> places = parkingRepository.findByOwnerId(ownerId);
        if (places.isEmpty()) return List.of();

        // 2. Extract IDs
        List<Long> placeIds = places.stream().map(ParkingPlace::getId).toList();

        // 3. Find reservations
        return reservationRepository.findByParkingPlaceIdInOrderByCreatedAtDesc(placeIds);
    }

    @Override
    public Reservation confirmReservation(Long reservationId, Long ownerId) {
        Reservation r = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found."));

        // Verify ownership
        ParkingPlace place = parkingRepository.findById(r.getParkingPlaceId())
                .orElseThrow(() -> new RuntimeException("Parking place not found."));
        if (!place.getOwnerId().equals(ownerId))
            throw new RuntimeException("Unauthorized: You do not own this parking place.");

        r.setStatus("CONFIRMED");
        return reservationRepository.save(r);
    }

    @Override
    public Reservation cancelReservationByOwner(Long reservationId, Long ownerId) {
        Reservation r = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found."));

        // Verify ownership
        ParkingPlace place = parkingRepository.findById(r.getParkingPlaceId())
                .orElseThrow(() -> new RuntimeException("Parking place not found."));
        if (!place.getOwnerId().equals(ownerId))
            throw new RuntimeException("Unauthorized: You do not own this parking place.");

        r.setStatus("CANCELLED");

        // Restore slot count
        place.setSlots(place.getSlots() + 1);
        parkingRepository.save(place);

        return reservationRepository.save(r);
    }
}
