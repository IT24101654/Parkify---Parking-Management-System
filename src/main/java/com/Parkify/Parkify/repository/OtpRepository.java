package com.Parkify.Parkify.repository;

import com.Parkify.Parkify.model.Otp;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface OtpRepository extends MongoRepository<Otp, Long> {
    Optional<Otp> findByEmail(String email);
    void deleteByEmail(String email);
}

