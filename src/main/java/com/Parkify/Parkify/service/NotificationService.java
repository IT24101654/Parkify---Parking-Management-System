package com.Parkify.Parkify.service;

import com.Parkify.Parkify.model.Notification;
import com.Parkify.Parkify.model.Role;
import com.Parkify.Parkify.model.User;
import com.Parkify.Parkify.repository.NotificationRepository;
import com.Parkify.Parkify.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    public void notifyAdminsOnNewUserRegistration(User newUser) {
        // Find all Super Admins
        List<User> admins = userRepository.findAllByRole(Role.SUPER_ADMIN);
        
        for (User admin : admins) {
            // Save in-app notification
            Notification notification = new Notification();
            notification.setAdmin(admin);
            
            String roleName = newUser.getRole().name().replace("_", " ");
            notification.setMessage(String.format("New %s registered: %s (%s)", roleName, newUser.getName(), newUser.getEmail()));
            notification.setType("REGISTRATION");
            notification.setRead(false);
            
            notificationRepository.save(notification);

            // Send email to Super Admin
            try {
                emailService.sendNewUserNotificationEmail(admin.getEmail(), newUser);
            } catch (Exception e) {
                // Log and ignore email errors so it doesn't break registration
                System.err.println("Failed to send notification email to admin " + admin.getEmail());
                e.printStackTrace();
            }
        }
    }

    public List<Notification> getNotificationsForAdmin(Long adminId) {
        return notificationRepository.findByAdminIdOrderByCreatedAtDesc(adminId);
    }

    public void markAsRead(Long notificationId) {
        Optional<Notification> notifOpt = notificationRepository.findById(notificationId);
        if (notifOpt.isPresent()) {
            Notification notification = notifOpt.get();
            notification.setRead(true);
            notificationRepository.save(notification);
        }
    }
}
