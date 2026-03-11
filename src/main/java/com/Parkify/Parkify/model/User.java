package com.Parkify.Parkify.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Email(message = "Invalid email format")
    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "two_factor_enabled")
    private boolean twoFactorEnabled = false;

    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Vehicle> vehicles;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    @Pattern(regexp = "^\\d{10}$", message = "Phone number must be 10 digits")
    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "address")
    private String address;

    @Column(name = "profile_picture")
    private String profilePicture;

    @Pattern(regexp = "^([0-9]{9}[vVxX]|[0-9]{12})$", message = "Invalid NIC format. Must be 10 (with V/X) or 12 digits.")
    @Column(name = "nic_number", unique = true)
    private String nicNumber;

    @Column(name = "nic_image")
    private String nicImage;
}