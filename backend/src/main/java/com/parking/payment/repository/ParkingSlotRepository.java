package com.parking.payment.repository;

import com.parking.payment.entity.ParkingSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, Long> {
    List<ParkingSlot> findByOwnerId(Long ownerId);
}
