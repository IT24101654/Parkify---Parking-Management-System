package com.Parkify.Parkify.repository;

import com.Parkify.Parkify.model.Inventory;
import com.Parkify.Parkify.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import com.Parkify.Parkify.model.Role;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    List<Inventory> findByInventoryType(String type);

    List<Inventory> findByUser(User user);

    List<Inventory> findByInventoryTypeAndUser(String type, User user);

    List<Inventory> findByInventoryTypeAndUser_Role(String type, Role role);
    List<Inventory> findByUser_Id(Long userId);
    @org.springframework.data.jpa.repository.Query(value = "SELECT COUNT(*) FROM inventory", nativeQuery = true)
    long countAllInventory();

    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM inventory WHERE parking_place_id = :parkingPlaceId", nativeQuery = true)
    List<java.util.Map<String, Object>> findRawByParkingPlaceId(@org.springframework.data.repository.query.Param("parkingPlaceId") Long parkingPlaceId);

    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM inventory WHERE parking_place_id = :parkingPlaceId", nativeQuery = true)
    List<Inventory> findByParkingPlace_Id_Native(@org.springframework.data.repository.query.Param("parkingPlaceId") Long parkingPlaceId);

    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM inventory WHERE UPPER(inventory_type) IN :types AND parking_place_id = :parkingPlaceId", nativeQuery = true)
    List<Inventory> findByInventoryTypesAndParkingPlace_Id_Native(@org.springframework.data.repository.query.Param("types") List<String> types, @org.springframework.data.repository.query.Param("parkingPlaceId") Long parkingPlaceId);
}
