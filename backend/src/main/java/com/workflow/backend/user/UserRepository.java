package com.workflow.backend.user;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);

    Optional<User> findByRole(Role role);

    boolean existsByEmail(String email);

    boolean existsByRole(Role role);
}
