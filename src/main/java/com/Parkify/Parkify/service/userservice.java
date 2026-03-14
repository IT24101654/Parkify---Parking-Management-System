package com.Parkify.Parkify.service;

import com.Parkify.Parkify.model.User;
import java.util.List;

public interface userservice {
    User registerUser(User user);
    User loginUser(String email, String password);
    User getUserById(Long id);
    List<User> getAllUsers();
    void toggleUserStatus(Long id, boolean status);
    void deleteUser(Long id);
    User updateUser(Long id, User user);
    void forgotPassword(String email);
    boolean resetPassword(String email, String otp, String newPassword);
    User getUserByEmail(String email);
    User updateProfile(Long userId, String name, String phoneNumber, String address);
    void updateProfilePicture(Long userId, String fileName);
    void updateVerificationDetails(Long userId, String nicNumber, String nicImage);
}