package com.Parkify.Parkify.serviceImpl;

import com.Parkify.Parkify.model.ActivityLog;
import com.Parkify.Parkify.model.FavoriteLocation;
import com.Parkify.Parkify.repository.ActivityLogRepository;
import com.Parkify.Parkify.repository.FavoriteLocationRepository;
import com.Parkify.Parkify.service.UserServiceExtra;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserServiceExtraImpl implements UserServiceExtra {
    @Autowired
    private ActivityLogRepository logRepo;
    @Autowired
    private FavoriteLocationRepository favRepo;

    @Override
    public void logActivity(Long userId, String action) {
        ActivityLog log = new ActivityLog(null, userId, action, LocalDateTime.now());
        logRepo.save(log);
    }

    @Override
    public List<ActivityLog> getUserLogs(Long userId) {
        return logRepo.findByUserIdOrderByTimestampDesc(userId);
    }

    @Override
    public FavoriteLocation addFavorite(Long userId, Long slotId) {
        if(!favRepo.existsByUserIdAndParkingSlotId(userId, slotId)) {
            return favRepo.save(new FavoriteLocation(null, userId, slotId));
        }
        return null;
    }

    @Override
    public List<FavoriteLocation> getFavorites(Long userId) {
        return favRepo.findByUserId(userId);
    }
}
