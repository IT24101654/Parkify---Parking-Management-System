package com.Parkify.Parkify.service;

import com.Parkify.Parkify.model.User;

import java.util.List;

public interface UserService {

    User registerUser(User user);

    boolean existsByEmail(String email);

    User loginUser(String email, String password);

    User getUserById(Long id);

    List<User> getAllUsers();

    void toggleUserStatus(Long id, boolean status);

    void deleteUser(Long id);

    User updateUser(Long id, User user);

    void forgotPassword(String email);

    boolean resetPassword(String email, String otp, String newPassword);

    User getUserByEmail(String email);

    List<User> getUsersByEmail(String email);

    User getUserByEmailAndRole(String email, com.Parkify.Parkify.model.Role role);

    List<String> getRolesForEmail(String email);

    User updateProfile(Long userId, String name, String phoneNumber, String address, String nicNumber);

    void updateProfilePicture(Long userId, String fileName);

    void updateVerificationDetails(Long userId, String nicNumber, String nicImage);

    User updateUserFeatures(Long userId, Boolean hasInventory, Boolean hasServiceCenter);
}