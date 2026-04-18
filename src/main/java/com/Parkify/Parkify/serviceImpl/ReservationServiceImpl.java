package com.Parkify.Parkify.serviceImpl;

import com.Parkify.Parkify.model.ParkingPlace;
import com.Parkify.Parkify.model.Reservation;
import com.Parkify.Parkify.repository.ParkingRepository;
import com.Parkify.Parkify.repository.ReservationRepository;
import com.Parkify.Parkify.service.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ReservationServiceImpl implements ReservationService {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private ParkingRepository parkingRepository;

    @Override
    public Reservation bookParking(Long driverId, Map<String, Object> bookingData) {
        Long parkingPlaceId = Long.valueOf(bookingData.get("parkingPlaceId").toString());

        ParkingPlace place = parkingRepository.findById(parkingPlaceId)
                .orElseThrow(() -> new RuntimeException("Parking place not found with id: " + parkingPlaceId));

        if (place.getSlots() <= 0) {
            throw new RuntimeException("No available slots at this parking location.");
        }

        Reservation reservation = new Reservation();
        reservation.setDriverId(driverId);
        reservation.setParkingPlaceId(parkingPlaceId);
        reservation.setVehicleNumber(bookingData.getOrDefault("vehicleNumber", "").toString());
        reservation.setStartTime(bookingData.getOrDefault("startTime", "").toString());
        reservation.setEndTime(bookingData.getOrDefault("endTime", "").toString());
        reservation.setStatus("CONFIRMED");
        reservation.setParkingName(place.getParkingName());
        reservation.setParkingLocation(place.getLocation());
        reservation.setPricePerHour(place.getPrice());

        // Decrement available slots
        place.setSlots(place.getSlots() - 1);
        parkingRepository.save(place);

        return reservationRepository.save(reservation);
    }

    @Override
    public List<Reservation> getMyReservations(Long driverId) {
        return reservationRepository.findByDriverIdOrderByCreatedAtDesc(driverId);
    }

    @Override
    public Reservation cancelReservation(Long reservationId, Long driverId) {
        Optional<Reservation> opt = reservationRepository.findById(reservationId);
        if (opt.isEmpty())
            throw new RuntimeException("Reservation not found.");
        Reservation r = opt.get();
        if (!r.getDriverId().equals(driverId))
            throw new RuntimeException("Unauthorized.");
        r.setStatus("CANCELLED");

        // Restore the slot
        Optional<ParkingPlace> placeOpt = parkingRepository.findById(r.getParkingPlaceId());
        placeOpt.ifPresent(place -> {
            place.setSlots(place.getSlots() + 1);
            parkingRepository.save(place);
        });

        return reservationRepository.save(r);
    }
}
