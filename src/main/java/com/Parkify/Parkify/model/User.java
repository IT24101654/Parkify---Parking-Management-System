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
@Table(
    name = "users",
    uniqueConstraints = @jakarta.persistence.UniqueConstraint(
        name = "uk_users_email_role",
        columnNames = {"email", "role"}
    )
)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Email(message = "Invalid email format")
    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Pattern(regexp = "^\\d{10}$", message = "Phone number must be 10 digits")
    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "address")
    private String address;

    @Column(name = "has_inventory")
    private Boolean hasInventory = false;

    @Column(name = "has_service_center")
    private Boolean hasServiceCenter = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private com.Parkify.Parkify.model.Role role;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "two_factor_enabled")
    private Boolean twoFactorEnabled = false;

    @Column(name = "profile_picture")
    private String profilePicture;

    @Pattern(regexp = "^([0-9]{9}[vVxX]|[0-9]{12})$", message = "Invalid NIC format. Must be 10 (with V/X) or 12 digits.")
    @Column(name = "nic_number")
    private String nicNumber;

    @Column(name = "nic_image")
    private String nicImage;

    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Vehicle> vehicles;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Inventory> inventories;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private ServiceCenter serviceCenter;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}