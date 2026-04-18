package com.Parkify.Parkify.dto;

import com.Parkify.Parkify.model.Role;
import com.Parkify.Parkify.model.Vehicle;
import lombok.Data;
import java.util.List;

@Data
public class AdminUserDTO {
    private Long id;
    private String name;
    private String email;
    private String phoneNumber;
    private Role role;
    private Boolean active;
    private String address;
    private String profilePicture;
    private List<Vehicle> vehicles;
}
