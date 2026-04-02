package com.Parkify.Parkify.repository;

import com.Parkify.Parkify.model.Role;
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


    List<User> findAllByRole(Role role);
    List<User> findAllByEmailIgnoreCase(String email);
    List<User> findAllByEmailIgnoreCaseAndRole(String email, Role role);

    Optional<User> findByEmailIgnoreCaseAndRole(String email, Role role);


        boolean existsByEmailIgnoreCaseAndRole(String email, Role role);

        long countByRole(Role role);
}