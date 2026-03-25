package com.Parkify.Parkify.serviceImpl;

import com.Parkify.Parkify.model.Role;
import com.Parkify.Parkify.model.User;
import com.Parkify.Parkify.repository.UserRepository;
import com.Parkify.Parkify.service.EmailService;
import com.Parkify.Parkify.service.OtpService;
import com.Parkify.Parkify.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private OtpService otpService;

    @Autowired
    private EmailService emailService;

    // ─────────────────────────────────────────────────────────────
    // REGISTRATION
    // ─────────────────────────────────────────────────────────────

    @Override
    public User registerUser(User user) {
        String normalizedEmail = user.getEmail().trim().toLowerCase();
        user.setEmail(normalizedEmail);

        if (user.getRole() == null) {
            user.setRole(Role.DRIVER);
        }

        // Prevent duplicate (email + role) pair
        if (userRepository.existsByEmailIgnoreCaseAndRole(normalizedEmail, user.getRole())) {
            throw new RuntimeException("This email is already registered as " + user.getRole().name());
        }

        // Only one SUPER_ADMIN allowed system-wide
        if (user.getRole() == Role.SUPER_ADMIN) {
            long adminCount = userRepository.countByRole(Role.SUPER_ADMIN);
            if (adminCount >= 1) {
                throw new RuntimeException("A SUPER_ADMIN account already exists in the system.");
            }
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setActive(true);
        user.setTwoFactorEnabled(false);

        return userRepository.save(user);
    }

    // ─────────────────────────────────────────────────────────────
    // LOGIN – validate credentials (role-agnostic password check)
    // ─────────────────────────────────────────────────────────────

    @Override
    public User loginUser(String email, String password) {
        String normalizedEmail = email.trim().toLowerCase();

        List<User> users = userRepository.findAllByEmailIgnoreCase(normalizedEmail);
        if (users.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        // All rows share the same password (they belong to the same person).
        // Validate against the first row; they should all match.
        User anyUser = users.get(0);

        if (!Boolean.TRUE.equals(anyUser.getActive())) {
            throw new RuntimeException("Account is deactivated");
        }

        if (!passwordEncoder.matches(password, anyUser.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        return anyUser; // caller only needs confirmation; roles fetched separately
    }

    // ─────────────────────────────────────────────────────────────
    // MULTI-ROLE LOOKUPS
    // ─────────────────────────────────────────────────────────────

    @Override
    public List<User> getUsersByEmail(String email) {
        return userRepository.findAllByEmailIgnoreCase(email.trim().toLowerCase());
    }

    @Override
    public User getUserByEmailAndRole(String email, Role role) {
        return userRepository.findByEmailIgnoreCaseAndRole(email.trim().toLowerCase(), role)
                .orElseThrow(() -> new RuntimeException(
                        "No account found for email " + email + " with role " + role.name()));
    }

    @Override
    public List<String> getRolesForEmail(String email) {
        return userRepository.findAllByEmailIgnoreCase(email.trim().toLowerCase())
                .stream()
                .map(u -> u.getRole().name())
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────
    // EXISTENCE CHECKS
    // ─────────────────────────────────────────────────────────────

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    // ─────────────────────────────────────────────────────────────
    // STANDARD CRUD
    // ─────────────────────────────────────────────────────────────

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public void toggleUserStatus(Long id, boolean status) {
        User user = getUserById(id);
        user.setActive(status);
        userRepository.save(user);
    }

    @Override
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(id);
    }

    @Override
    public User updateUser(Long id, User userDetails) {
        User user = getUserById(id);
        if (userDetails.getName() != null) {
            user.setName(userDetails.getName());
        }
        if (userDetails.getRole() != null) {
            user.setRole(userDetails.getRole());
        }
        return userRepository.save(user);
    }

    // ─────────────────────────────────────────────────────────────
    // PASSWORD RESET
    // ─────────────────────────────────────────────────────────────

    @Override
    public void forgotPassword(String email) {
        String normalizedEmail = email.trim().toLowerCase();
        List<User> users = userRepository.findAllByEmailIgnoreCase(normalizedEmail);
        if (users.isEmpty()) {
            throw new RuntimeException("User not found with this email");
        }
        String otp = otpService.generateOtp(normalizedEmail);
        emailService.sendOtpEmail(normalizedEmail, otp);
    }

    @Override
    public boolean resetPassword(String email, String otp, String newPassword) {
        String normalizedEmail = email.trim().toLowerCase();
        if (otpService.validateOtp(normalizedEmail, otp)) {
            // Reset password on ALL role-accounts for this email
            List<User> users = userRepository.findAllByEmailIgnoreCase(normalizedEmail);
            String encoded = passwordEncoder.encode(newPassword);
            users.forEach(u -> {
                u.setPassword(encoded);
                userRepository.save(u);
            });
            return true;
        }
        return false;
    }

    // ─────────────────────────────────────────────────────────────
    // PROFILE
    // ─────────────────────────────────────────────────────────────

    @Override
    public User getUserByEmail(String email) {
        String normalizedEmail = email.trim().toLowerCase();
        return userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    @Override
    public User updateProfile(Long userId, String name, String phoneNumber, String address) {
        User user = getUserById(userId);
        if (name != null) user.setName(name);
        if (phoneNumber != null) user.setPhoneNumber(phoneNumber);
        if (address != null) user.setAddress(address);
        return userRepository.save(user);
    }

    @Override
    public void updateProfilePicture(Long userId, String fileName) {
        User user = getUserById(userId);
        user.setProfilePicture(fileName);
        userRepository.save(user);
    }

    @Override
    public void updateVerificationDetails(Long userId, String nicNumber, String nicImage) {
        User user = getUserById(userId);
        if (nicNumber != null) user.setNicNumber(nicNumber);
        if (nicImage != null) user.setNicImage(nicImage);
        userRepository.save(user);
    }
}
