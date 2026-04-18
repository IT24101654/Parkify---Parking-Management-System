package com.Parkify.Parkify.controller;

import com.Parkify.Parkify.model.FavoriteLocation;
import com.Parkify.Parkify.service.UserServiceExtra;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/extras")
@CrossOrigin("*")
public class UserExtraController {
    @Autowired
    private UserServiceExtra service;

    @GetMapping("/logs/{userId}")

    public ResponseEntity<?> getLogs(@PathVariable("userId") Long userId) {

        return ResponseEntity.ok(service.getUserLogs(userId));
    }

    @PostMapping("/favorites/add")

    public ResponseEntity<?> addFavorite(@RequestParam("userId") Long userId, @RequestParam("slotId") Long slotId) {

        FavoriteLocation fav = service.addFavorite(userId, slotId);
        return fav != null ? ResponseEntity.ok(fav) : ResponseEntity.badRequest().body("Already in favorites");
    }

    @GetMapping("/favorites/{userId}")

    public ResponseEntity<?> getFavorites(@PathVariable("userId") Long userId) {

        return ResponseEntity.ok(service.getFavorites(userId));
    }
}