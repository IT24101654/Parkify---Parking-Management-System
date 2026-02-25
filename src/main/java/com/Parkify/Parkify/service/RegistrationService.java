package com.Parkify.Parkify.service;

import com.Parkify.Parkify.model.User;

public interface RegistrationService {

        void storePendingUser(User pendingUser);

        User getPendingUser(String email, String role);

        void removePendingUser(String email, String role);
}
