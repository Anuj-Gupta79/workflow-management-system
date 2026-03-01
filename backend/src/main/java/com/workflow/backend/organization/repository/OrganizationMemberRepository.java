package com.workflow.backend.organization.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.workflow.backend.organization.entity.OrganizationMember;
import com.workflow.backend.organization.utility.OrganizationRole;

public interface OrganizationMemberRepository extends JpaRepository<OrganizationMember, Long> {
    // Find all members of an organization
    List<OrganizationMember> findByOrganizationId(Long organizationId);

    // Find all organizations a user belongs to
    List<OrganizationMember> findByUserId(Long userId);

    // Find a specific member by organization and user
    Optional<OrganizationMember> findByOrganizationIdAndUserIdAndDeletedFalse(Long organizationId, Long userId);

    // Find all members with a specific role in an organization
    List<OrganizationMember> findByOrganizationIdAndRole(Long organizationId, OrganizationRole role);

    // Optional: all non-deleted members
    List<OrganizationMember> findByOrganizationIdAndDeletedFalse(Long organizationId);
}
