package com.Parkify.Parkify.repository;

import com.Parkify.Parkify.model.ServiceItem;
import com.Parkify.Parkify.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ServiceItemRepository extends JpaRepository<ServiceItem, Long> {
    List<ServiceItem> findByUser(User user);
    List<ServiceItem> findByServiceCenterId(Long serviceCenterId);
    List<ServiceItem> findByUserAndCategory(User user, String category);
}
