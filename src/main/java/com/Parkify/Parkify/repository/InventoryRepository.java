package com.Parkify.Parkify.repository;

import com.Parkify.Parkify.model.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import com.Parkify.Parkify.model.Role;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    List<Inventory> findByInventoryType(String type);
    List<Inventory> findByInventoryTypeAndUser_Role(String type, Role role);
}
