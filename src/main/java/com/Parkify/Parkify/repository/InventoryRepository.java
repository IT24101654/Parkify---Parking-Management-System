package com.Parkify.Parkify.repository;

import com.Parkify.Parkify.model.Inventory;
import com.Parkify.Parkify.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

import com.Parkify.Parkify.model.Role;

public interface InventoryRepository extends MongoRepository<Inventory, Long> {
    List<Inventory> findByInventoryType(String type);

    List<Inventory> findByUser(User user);

    List<Inventory> findByInventoryTypeAndUser(String type, User user);

    List<Inventory> findByInventoryTypeAndUser_Role(String type, Role role);
    List<Inventory> findByUser_Id(Long userId);
    @org.springframework.data.mongodb.repository.Query(value = "{}", count = true)
    long countAllInventory();

    @org.springframework.data.mongodb.repository.Query(value = "{ 'parkingPlace.$id' : ?0 }")
    List<java.util.Map<String, Object>> findRawByParkingPlaceId(Long parkingPlaceId);

    @org.springframework.data.mongodb.repository.Query(value = "{ 'parkingPlace.$id' : ?0 }")
    List<Inventory> findByParkingPlace_Id_Native(Long parkingPlaceId);

    @org.springframework.data.mongodb.repository.Query(value = "{ 'inventoryType' : { $in : ?0 }, 'parkingPlace.$id' : ?1 }")
    List<Inventory> findByInventoryTypesAndParkingPlace_Id_Native(List<String> types, Long parkingPlaceId);
}


