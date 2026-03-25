package com.Parkify.Parkify.service;

import com.Parkify.Parkify.model.User;

public interface RegistrationService {
    /** Store pending user keyed by email:role */
    void storePendingUser(User pendingUser);

    /** Retrieve pending user by email and role name (e.g. "DRIVER") */
    User getPendingUser(String email, String role);

    /** Remove pending user entry after successful registration */
    void removePendingUser(String email, String role);
}
