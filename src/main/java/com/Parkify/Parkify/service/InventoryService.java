package com.Parkify.Parkify.service;

import com.Parkify.Parkify.model.Inventory;
import com.Parkify.Parkify.dto.InventoryRequest;
import java.util.List;

public interface InventoryService {
    Inventory saveItem(InventoryRequest request);
    List<Inventory> getItemsByType(String type);
    List<Inventory> getItemsByTypeForDriver(String type);
    Inventory updateItem(Long id, InventoryRequest request);
    void deleteItem(Long id);
}
