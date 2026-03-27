package com.Parkify.Parkify.repository;

import com.Parkify.Parkify.model.ParkingPlace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ParkingRepository extends JpaRepository<ParkingPlace, Long> {
    boolean existsByParkingNameAndLocation(String parkingName, String location);
    boolean existsByParkingNameAndLocationAndIdNot(String parkingName, String location, Long id);
}