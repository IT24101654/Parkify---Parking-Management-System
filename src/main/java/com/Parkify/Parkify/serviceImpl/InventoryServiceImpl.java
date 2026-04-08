package com.Parkify.Parkify.serviceImpl;

import com.Parkify.Parkify.dto.InventoryRequest;
import com.Parkify.Parkify.model.Inventory;
import com.Parkify.Parkify.model.User;
import com.Parkify.Parkify.model.ParkingPlace;
import com.Parkify.Parkify.repository.InventoryRepository;
import com.Parkify.Parkify.repository.UserRepository;
import com.Parkify.Parkify.repository.ParkingRepository;
import com.Parkify.Parkify.service.InventoryService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Objects;

@Service
public class InventoryServiceImpl implements InventoryService {

    @Autowired
    private InventoryRepository repository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ParkingRepository parkingRepository;

    private User getCurrentUser() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        String roleStr = authentication.getAuthorities().iterator().next().getAuthority();
        com.Parkify.Parkify.model.Role role = com.Parkify.Parkify.model.Role.valueOf(roleStr);

        return userRepository.findByEmailIgnoreCaseAndRole(email, role)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email + " and role: " + role));
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

    @SuppressWarnings("null")
    @Override
    public Inventory updateItem(Long id, InventoryRequest req) {
        Objects.requireNonNull(id, "Item ID cannot be null");
        Inventory item = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found with id: " + id));
        return mapAndSave(item, req);
    }

    @Override
    public void deleteItem(Long id) {
        repository.deleteById(id);
    }

    @Override
    public List<Inventory> getOwnerInventory() {
        return repository.findByUser(getCurrentUser());
    }

    @Override
    public List<Inventory> getOwnerInventoryByType(String type) {
        return repository.findByInventoryTypeAndUser(type, getCurrentUser());
    }

    @Override
    public List<Inventory> getItemsByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        return repository.findByUser(user);
    }

    @Override
    public List<Inventory> getItemsByParkingPlace(Long parkingPlaceId) {
        System.out.println("OWNER-LEVEL-FETCH: Initializing fetch for PlaceID: " + parkingPlaceId);
        
        ParkingPlace place = parkingRepository.findById(parkingPlaceId)
                .orElseThrow(() -> new RuntimeException("Parking Place not found with id: " + parkingPlaceId));
        
        if (Boolean.TRUE.equals(place.getHasInventory())) {
            System.out.println("OWNER-LEVEL-FETCH: Place has inventory enabled. Fetching for OwnerID: " + place.getOwnerId());
            // Fetch shared inventory for the owner of this place
            return repository.findByUser_Id(place.getOwnerId());
        } else {
            System.out.println("OWNER-LEVEL-FETCH: Place has inventory DISABLED. Returning empty list.");
            return java.util.Collections.emptyList();
        }
    }

    @Override
    public List<Inventory> getItemsByParkingPlaceAndType(Long parkingPlaceId, String type) {
        return getItemsByParkingPlace(parkingPlaceId);
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

        // Inventory is now Owner-Level, not linked to a specific ParkingPlace
        item.setParkingPlace(null);

        Inventory savedItem = repository.save(item);
        System.out.println("DEBUG: Saved Owner-Level item with ID: " + savedItem.getId() + " for Owner: " + savedItem.getUser().getEmail());
        return savedItem;
    }
}
