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

    @Override
    public User registerUser(User user) {
        String normalizedEmail = user.getEmail().trim().toLowerCase();
        user.setEmail(normalizedEmail);

        if(userRepository.existsByEmail(normalizedEmail)){
            throw new RuntimeException("Email is already registered");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        if (user.getRole() == null) {
            user.setRole(Role.DRIVER);
        }

        user.setActive(true);
        user.setTwoFactorEnabled(false);

        return userRepository.save(user);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public User loginUser(String email, String password) {
        String normalizedEmail = email.trim().toLowerCase();
        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.isActive()) {
            throw new RuntimeException("Account is deactivated");
        }

        if (passwordEncoder.matches(password, user.getPassword())) {
            return user;
        } else {
            throw new RuntimeException("Invalid credentials");
        }
    }

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
        if(!userRepository.existsById(id)){
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
        if(userDetails.getRole() != null) {
            user.setRole(userDetails.getRole());
        }
        return userRepository.save(user);
    }

    @Override
    public void forgotPassword(String email) {
        String normalizedEmail = email.trim().toLowerCase();

        var userOpt = userRepository.findByEmailIgnoreCase(normalizedEmail);
        if(userOpt.isEmpty()) {
            System.out.println("[DEBUG] forgotPassword: email not found after normalization = '" + normalizedEmail + "'");
            throw new RuntimeException("User not found with this email");
        }

        String otp = otpService.generateOtp(normalizedEmail);
        emailService.sendOtpEmail(normalizedEmail, otp);
    }

    @Override
    public boolean resetPassword(String email, String otp, String newPassword) {
        if(otpService.validateOtp(email, otp)) {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            return true;
        }
        return false;
    }

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