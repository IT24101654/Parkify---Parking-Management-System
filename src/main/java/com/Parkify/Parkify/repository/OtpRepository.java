package com.Parkify.Parkify.repository;

import com.Parkify.Parkify.model.Otp;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OtpRepository extends JpaRepository<Otp, Long> {
    Optional<Otp> findByEmail(String email);
    void deleteByEmail(String email);
}