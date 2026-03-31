package com.Parkify.Parkify.serviceImpl;

import com.Parkify.Parkify.model.User;
import com.Parkify.Parkify.service.RegistrationService;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RegistrationServiceImpl implements RegistrationService {

    private final Map<String, User> pendingUsers = new ConcurrentHashMap<>();

    @Override
    public void storePendingUser(User pendingUser) {
        pendingUsers.put(pendingUser.getEmail(), pendingUser);
    }

    @Override
    public User getPendingUser(String email) {
        return pendingUsers.get(email);
    }

    @Override
    public void removePendingUser(String email) {
        pendingUsers.remove(email);
    }
}
