package com.workflow.backend.organization.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.workflow.backend.organization.entity.Organization;

public interface OrganizationRepository extends JpaRepository<Organization, Long> {
    Optional<Organization> findByIdAndDeletedFalse(Long id);

    // Find all organizations owned by a specific user
    List<Organization> findByOwnerIdAndDeletedFalse(Long ownerId);

    // Optional: find all non-deleted organizations
    List<Organization> findByDeletedFalse();

    // Optional: find organization by name
    List<Organization> findByNameContainingIgnoreCase(String name);
}
