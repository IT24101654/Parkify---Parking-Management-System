package com.Parkify.Parkify.repository;

import com.Parkify.Parkify.model.ServiceCenter;
import com.Parkify.Parkify.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface ServiceCenterRepository extends MongoRepository<ServiceCenter, Long> {
    Optional<ServiceCenter> findByUser(User user);

    Optional<ServiceCenter> findByUserId(Long userId);
}


