package com.Parkify.Parkify.serviceImpl;

import com.Parkify.Parkify.model.User;
import com.Parkify.Parkify.service.RegistrationService;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RegistrationServiceImpl implements RegistrationService {

    /**
     * Key format: "email:ROLE" — e.g. "alice@example.com:DRIVER"
     * This allows the same email to have separate pending entries per role.
     */
    private final Map<String, User> pendingUsers = new ConcurrentHashMap<>();

    private String key(String email, String role) {
        return email.trim().toLowerCase() + ":" + role.toUpperCase();
    }

    @Override
    public void storePendingUser(User pendingUser) {
        String k = key(pendingUser.getEmail(), pendingUser.getRole().name());
        pendingUsers.put(k, pendingUser);
    }

    @Override
    public User getPendingUser(String email, String role) {
        return pendingUsers.get(key(email, role));
    }

    @Override
    public void removePendingUser(String email, String role) {
        pendingUsers.remove(key(email, role));
    }
}
