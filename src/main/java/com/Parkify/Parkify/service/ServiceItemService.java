package com.Parkify.Parkify.service;

import com.Parkify.Parkify.dto.ServiceItemRequest;
import com.Parkify.Parkify.model.Role;
import com.Parkify.Parkify.model.ServiceCenter;
import com.Parkify.Parkify.model.ServiceItem;
import com.Parkify.Parkify.model.User;
import com.Parkify.Parkify.repository.ServiceCenterRepository;
import com.Parkify.Parkify.repository.ServiceItemRepository;
import com.Parkify.Parkify.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ServiceItemService {

    @Autowired
    private ServiceItemRepository repository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ServiceCenterRepository serviceCenterRepository;

    /**
     * Retrieves the authenticated PARKING_OWNER user.
     * Uses role-aware lookup (same pattern as InventoryServiceImpl) to avoid
     * returning wrong-role users when multiple accounts share the same email.
     */
    private User getAuthenticatedUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmailIgnoreCaseAndRole(email, Role.PARKING_OWNER)
                .orElseThrow(() -> new RuntimeException(
                        "Authenticated user not found as PARKING_OWNER: " + email));
    }

    public List<ServiceItem> getOwnerItems() {
        return repository.findByUser(getAuthenticatedUser());
    }

    public List<ServiceItem> getItemsByServiceCenter(Long serviceCenterId) {
        return repository.findByServiceCenterId(serviceCenterId);
    }

    public ServiceItem saveItem(ServiceItemRequest request) {
        User user = getAuthenticatedUser();

        ServiceCenter center = serviceCenterRepository.findById(request.getServiceCenterId())
                .orElseThrow(() -> new RuntimeException(
                        "Service Center not found with id: " + request.getServiceCenterId()));

        ServiceItem item = new ServiceItem();
        item.setName(request.getName());
        item.setCategory(request.getCategory());
        item.setDescription(request.getDescription());
        item.setPrice(request.getPrice());
        item.setEstimatedTime(request.getEstimatedTime());
        item.setActive(true); // Explicitly set — never rely solely on field initializer
        item.setUser(user);
        item.setServiceCenter(center);

        ServiceItem saved = repository.save(item);
        System.out.println("ServiceItem saved: id=" + saved.getId()
                + ", category=" + saved.getCategory()
                + ", owner=" + user.getEmail());
        return saved;
    }

    public ServiceItem updateItem(Long id, ServiceItemRequest request) {
        ServiceItem item = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service Item not found with id: " + id));

        User user = getAuthenticatedUser();
        if (!item.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to update service item id: " + id);
        }

        item.setName(request.getName());
        item.setCategory(request.getCategory());
        item.setDescription(request.getDescription());
        item.setPrice(request.getPrice());
        item.setEstimatedTime(request.getEstimatedTime());

        return repository.save(item);
    }

    public void deleteItem(Long id) {
        ServiceItem item = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service Item not found with id: " + id));

        User user = getAuthenticatedUser();
        if (!item.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to delete service item id: " + id);
        }

        repository.delete(item);
    }
}
