package com.Parkify.Parkify.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerifyRequest {
    private String email;
    private String otp;
    /**
     * Optional – used during login OTP verification when the user had multiple roles
     * and had to select one. For registration OTP this field is null/empty.
     */
    private String role;
}