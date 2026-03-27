package com.Parkify.Parkify.controller;

import com.Parkify.Parkify.model.FavoriteLocation;
import com.Parkify.Parkify.model.User;
import com.Parkify.Parkify.service.FavoriteService;
import com.Parkify.Parkify.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
@CrossOrigin(origins = "*")
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;

    @Autowired
    private UserService userService;

    private Long getAuthenticatedUserId(Authentication authentication) {
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        return user.getId();
    }

    @PostMapping("/add/{parkingSlotId}")
    public ResponseEntity<?> addFavorite(@PathVariable("parkingSlotId") Long parkingSlotId, Authentication authentication) {
        try {
            Long userId = getAuthenticatedUserId(authentication);
            FavoriteLocation favorite = favoriteService.addFavorite(userId, parkingSlotId);
            return ResponseEntity.ok(favorite);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/remove/{parkingSlotId}")
    public ResponseEntity<?> removeFavorite(@PathVariable("parkingSlotId") Long parkingSlotId, Authentication authentication) {
        try {
            Long userId = getAuthenticatedUserId(authentication);
            favoriteService.removeFavorite(userId, parkingSlotId);
            return ResponseEntity.ok(Map.of("message", "Successfully removed from favorites"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my-favorites")
    public ResponseEntity<?> getMyFavorites(Authentication authentication) {
        try {
            Long userId = getAuthenticatedUserId(authentication);
            List<FavoriteLocation> favorites = favoriteService.getFavoritesByUserId(userId);
            return ResponseEntity.ok(favorites);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
