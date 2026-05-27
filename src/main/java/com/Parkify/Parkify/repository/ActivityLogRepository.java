package com.Parkify.Parkify.repository;

import com.Parkify.Parkify.model.ActivityLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ActivityLogRepository extends MongoRepository<ActivityLog, Long> {
    List<ActivityLog> findByUserIdOrderByTimestampDesc(Long userId);
}

