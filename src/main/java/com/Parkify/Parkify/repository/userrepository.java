package com.Parkify.Parkify.repository;

import com.Parkify.Parkify.model.Role;
import com.Parkify.Parkify.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // --- Single-result lookups (for password reset / single-role flows) ---
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailIgnoreCase(String email);

    // --- Multi-role lookups ---
    /** Returns all accounts (rows) associated with an email, across all roles. */
    List<User> findAllByEmailIgnoreCase(String email);

    /** Returns the account for a specific (email, role) pair. */
    Optional<User> findByEmailIgnoreCaseAndRole(String email, Role role);

    // --- Existence checks ---
    boolean existsByEmail(String email);
    boolean existsByEmailIgnoreCase(String email);

    /** True only if this exact (email, role) combination already exists. */
    boolean existsByEmailIgnoreCaseAndRole(String email, Role role);

    /** Count how many SUPER_ADMIN accounts exist. */
    long countByRole(Role role);
}