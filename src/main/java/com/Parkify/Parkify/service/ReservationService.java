package com.Parkify.Parkify.service;

import com.Parkify.Parkify.model.Reservation;
import java.util.List;
import java.util.Map;

public interface ReservationService {
    Reservation bookParking(Long driverId, Map<String, Object> bookingData);
    List<Reservation> getMyReservations(Long driverId);
    Reservation cancelReservation(Long reservationId, Long driverId);
    Reservation updateReservation(Long id, Long driverId, Map<String, Object> data);
    Reservation getReservationById(Long id, Long driverId);
    List<Reservation> getAllReservations();
    List<Reservation> getReservationsForOwner(Long ownerId);
    Reservation confirmReservation(Long reservationId, Long ownerId);
    Reservation cancelReservationByOwner(Long reservationId, Long ownerId);
}
