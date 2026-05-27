package com.Parkify.Parkify.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Document
@Data
@NoArgsConstructor
@AllArgsConstructor
@lombok.ToString(exclude = "serviceCenter")
@lombok.EqualsAndHashCode(exclude = "serviceCenter")
public class User {

    @Id
    private Long id;

    private String name;

    @Email(message = "Invalid email format")
    private String email;

    private String password;

    @Pattern(regexp = "^\\d{10}$", message = "Phone number must be 10 digits")
    private String phoneNumber;

    private String address;

    private Boolean hasInventory = false;

    private Boolean hasServiceCenter = false;

    private com.Parkify.Parkify.model.Role role;

    private Boolean active = true;

    private LocalDateTime createdAt;

    private Boolean twoFactorEnabled = false;

    private String profilePicture;

    @Pattern(regexp = "^([0-9]{9}[vVxX]|[0-9]{12})$", message = "Invalid NIC format. Must be 10 (with V/X) or 12 digits.")
    private String nicNumber;

    private String nicImage;

    @DBRef(lazy = true)
    @JsonIgnore
    private List<Vehicle> vehicles;

    @DBRef(lazy = true)
    @JsonIgnore
    private List<Inventory> inventories;

    @DBRef(lazy = true)
    @JsonIgnore
    private ServiceCenter serviceCenter;

    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

