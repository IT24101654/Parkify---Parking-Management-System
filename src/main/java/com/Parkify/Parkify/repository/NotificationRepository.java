package com.Parkify.Parkify.repository;

import com.Parkify.Parkify.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, Long> {
    List<Notification> findByAdminIdOrderByCreatedAtDesc(Long adminId);
    long countByAdminIdAndIsReadFalse(Long adminId);
}


