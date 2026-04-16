package com.parking.payment.config;

import com.parking.payment.entity.ParkingSlot;
import com.parking.payment.entity.Role;
import com.parking.payment.entity.User;
import com.parking.payment.repository.ParkingSlotRepository;
import com.parking.payment.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.Optional;

@Configuration
public class DatabaseSeeder {

    @Bean
    public CommandLineRunner seedDatabase(UserRepository userRepository, ParkingSlotRepository parkingSlotRepository, PasswordEncoder encoder) {
        return args -> {
            // Seed Driver
            Optional<User> driverOpt = userRepository.findByEmail("driver@parkify.com");
            if (driverOpt.isEmpty()) {
                User driver = new User();
                driver.setEmail("driver@parkify.com");
                driver.setFullName("Demo Driver");
                driver.setPasswordHash(encoder.encode("password123"));
                driver.setRole(Role.DRIVER);
                userRepository.save(driver);
            }

            // Seed Owner
            User owner;
            Optional<User> ownerOpt = userRepository.findByEmail("owner@parkify.com");
            if (ownerOpt.isEmpty()) {
                User o = new User();
                o.setEmail("owner@parkify.com");
                o.setFullName("Demo Property Owner");
                o.setPasswordHash(encoder.encode("password123"));
                o.setRole(Role.OWNER);
                owner = userRepository.save(o);
            } else {
                owner = ownerOpt.get();
            }

            // Seed Admin
            Optional<User> adminOpt = userRepository.findByEmail("admin@parkify.com");
            if (adminOpt.isEmpty()) {
                User admin = new User();
                admin.setEmail("admin@parkify.com");
                admin.setFullName("System Administrator");
                admin.setPasswordHash(encoder.encode("password123"));
                admin.setRole(Role.ADMIN);
                userRepository.save(admin);
            }

            // Seed Parking Slots (only if empty)
            if (parkingSlotRepository.count() == 0) {
                ParkingSlot slot1 = new ParkingSlot();
                slot1.setOwner(owner);
                slot1.setLocationName("Downtown Premium Lot");
                slot1.setAddress("123 Main St, Central District");
                slot1.setHourlyRate(new BigDecimal("150.00"));
                slot1.setIsActive(true);
                parkingSlotRepository.save(slot1);

                ParkingSlot slot2 = new ParkingSlot();
                slot2.setOwner(owner);
                slot2.setLocationName("Airport Metro Parking");
                slot2.setAddress("Termina 5 Boulevard");
                slot2.setHourlyRate(new BigDecimal("250.00"));
                slot2.setIsActive(true);
                parkingSlotRepository.save(slot2);

                ParkingSlot slot3 = new ParkingSlot();
                slot3.setOwner(owner);
                slot3.setLocationName("Stadium Event Parking");
                slot3.setAddress("400 Sports Arena Way");
                slot3.setHourlyRate(new BigDecimal("300.00"));
                slot3.setIsActive(true);
                parkingSlotRepository.save(slot3);
            }
        };
    }
}
