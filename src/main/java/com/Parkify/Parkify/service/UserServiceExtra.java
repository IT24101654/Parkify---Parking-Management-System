package com.Parkify.Parkify.service;

import com.Parkify.Parkify.model.ActivityLog;
import com.Parkify.Parkify.model.FavoriteLocation;

import java.util.List;

public interface UserServiceExtra {
    void logActivity(Long userId, String action);
    List<ActivityLog> getUserLogs(Long userId);
    FavoriteLocation addFavorite(Long userId, Long slotId);
    List<FavoriteLocation> getFavorites(Long userId);
}
