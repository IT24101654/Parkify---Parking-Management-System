package com.Parkify.Parkify.service;

import com.Parkify.Parkify.model.Reservation;
import java.util.List;
import java.util.Map;

public interface ReservationService {
    Reservation bookParking(Long driverId, Map<String, Object> bookingData);
    List<Reservation> getMyReservations(Long driverId);
    Reservation cancelReservation(Long reservationId, Long driverId);
}
