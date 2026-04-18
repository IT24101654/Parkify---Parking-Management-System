package com.Parkify.Parkify.repository;

import com.Parkify.Parkify.model.ServiceCenter;
import com.Parkify.Parkify.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ServiceCenterRepository extends JpaRepository<ServiceCenter, Long> {
    Optional<ServiceCenter> findByUser(User user);

    Optional<ServiceCenter> findByUserId(Long userId);
}
