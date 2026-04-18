package com.Parkify.Parkify.controller;

import com.Parkify.Parkify.model.Notification;
import com.Parkify.Parkify.model.User;
import com.Parkify.Parkify.service.NotificationService;
import com.Parkify.Parkify.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<?> getMyNotifications() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        // JwtAuthenticationFilter sets the principal as a plain email String (not UserDetails).
        // This was the bug: casting to UserDetails caused ClassCastException -> empty response.
        String email = auth.getPrincipal().toString();

        List<User> users = userService.getUsersByEmail(email);
        if (users.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        // Pick the SUPER_ADMIN record specifically (one email can have multiple roles)
        User currentUser = users.stream()
            .filter(u -> u.getRole().name().equals("SUPER_ADMIN"))
            .findFirst()
            .orElse(users.get(0));

        List<Notification> notifications = notificationService.getNotificationsForAdmin(currentUser.getId());
        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markNotificationAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
    }
}
