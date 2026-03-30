package com.Parkify.Parkify.repository;

import com.Parkify.Parkify.model.Role;
import com.Parkify.Parkify.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    List<User> findAllByRole(Role role);

    
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailIgnoreCase(String email);

    
        List<User> findAllByEmailIgnoreCase(String email);

        Optional<User> findByEmailIgnoreCaseAndRole(String email, Role role);

    
    boolean existsByEmail(String email);
    boolean existsByEmailIgnoreCase(String email);

        boolean existsByEmailIgnoreCaseAndRole(String email, Role role);

        long countByRole(Role role);
}