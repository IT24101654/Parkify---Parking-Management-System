package com.Parkify.Parkify.repository;

import com.Parkify.Parkify.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmail(String email);
    boolean existsByEmailIgnoreCase(String email);


    List<User> findAllByRole(com.Parkify.Parkify.model.Role role);
    List<User> findAllByEmailIgnoreCase(String email);
    List<User> findAllByEmailIgnoreCaseAndRole(String email, com.Parkify.Parkify.model.Role role);

    Optional<User> findByEmailIgnoreCaseAndRole(String email, com.Parkify.Parkify.model.Role role);


        boolean existsByEmailIgnoreCaseAndRole(String email, com.Parkify.Parkify.model.Role role);

        long countByRole(com.Parkify.Parkify.model.Role role);
}