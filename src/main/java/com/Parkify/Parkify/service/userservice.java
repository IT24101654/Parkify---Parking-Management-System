package com.Parkify.Parkify.service;

import com.Parkify.Parkify.model.Role;
import com.Parkify.Parkify.model.User;

import java.util.List;

public interface UserService {
    User registerUser(User user);

    boolean existsByEmail(String email);

    /** Validates credentials; returns any matching user row (password is shared across roles). */
    User loginUser(String email, String password);

    User getUserById(Long id);

    List<User> getAllUsers();

    void toggleUserStatus(Long id, boolean status);

    void deleteUser(Long id);

    User updateUser(Long id, User user);

    void forgotPassword(String email);

    boolean resetPassword(String email, String otp, String newPassword);

    /** Returns first user row for the email (used for password reset). */
    User getUserByEmail(String email);

    /** Returns ALL user rows for the email (all roles). */
    List<User> getUsersByEmail(String email);

    /** Returns the specific (email, role) account. */
    User getUserByEmailAndRole(String email, Role role);

    /** Returns list of role names registered under an email. */
    List<String> getRolesForEmail(String email);

    User updateProfile(Long userId, String name, String phoneNumber, String address, String nicNumber);

    void updateProfilePicture(Long userId, String fileName);

    void updateVerificationDetails(Long userId, String nicNumber, String nicImage);
}