package com.Parkify.Parkify.serviceImpl;

import com.Parkify.Parkify.dto.InventoryRequest;
import com.Parkify.Parkify.model.Inventory;
import com.Parkify.Parkify.repository.InventoryRepository;
import com.Parkify.Parkify.repository.UserRepository;
import com.Parkify.Parkify.service.InventoryService;
import com.Parkify.Parkify.model.User;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class InventoryServiceImpl implements InventoryService {

    @Autowired
    private InventoryRepository repository;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public Inventory saveItem(InventoryRequest req) {
        Inventory item = new Inventory();
        return mapAndSave(item, req);
    }

    @Override
    public List<Inventory> getItemsByType(String type) {
        return repository.findByInventoryType(type);
    }

    @Override
    public List<Inventory> getItemsByTypeForDriver(String type) {
        return repository.findByInventoryTypeAndUser_Role(type, com.Parkify.Parkify.model.Role.PARKING_OWNER);
    }

    @Override
    public Inventory updateItem(Long id, InventoryRequest req) {
        Inventory item = repository.findById(id).orElseThrow();
        return mapAndSave(item, req);
    }

    @Override
    public void deleteItem(Long id) {
        repository.deleteById(id);
    }

    private Inventory mapAndSave(Inventory item, InventoryRequest req) {
        item.setItemName(req.getItemName());
        item.setInventoryType(req.getInventoryType());
        item.setQuantity(req.getQuantity());
        item.setUnitPrice(req.getUnitPrice());
        item.setThresholdValue(req.getThresholdValue());

        if ("FOOD".equalsIgnoreCase(req.getInventoryType())) {
            item.setExpiryDate(req.getExpiryDate());
            item.setCategory(null);
            item.setSupplier(null);
            item.setLastRestockDate(null);
        } else if ("SPARE_PART".equalsIgnoreCase(req.getInventoryType())) {
            item.setCategory(req.getCategory());
            item.setSupplier(req.getSupplier());
            item.setExpiryDate(null);
            item.setLastRestockDate(null);
        } else if ("FUEL".equalsIgnoreCase(req.getInventoryType())) {
            item.setSupplier(req.getSupplier());
            item.setLastRestockDate(req.getLastRestockDate());
            item.setCategory(null);
            item.setExpiryDate(null);
        } else {
            item.setCategory(req.getCategory());
            item.setSupplier(req.getSupplier());
            item.setExpiryDate(req.getExpiryDate());
            item.setLastRestockDate(req.getLastRestockDate());
        }

        if (item.getUser() == null) {
            item.setUser(getCurrentUser());
        }
        return repository.save(item);
    }
}
