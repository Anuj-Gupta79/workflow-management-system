package com.workflow.backend.organization.service;

import java.util.List;

import com.workflow.backend.organization.dto.AddMemberRequest;
import com.workflow.backend.organization.entity.Organization;
import com.workflow.backend.organization.entity.OrganizationMember;
import com.workflow.backend.organization.utility.OrganizationRole;
import com.workflow.backend.user.entity.User;

public interface OrganizationMemberService {
    // Add a member to an organization
    OrganizationMember addMember(AddMemberRequest member);

    OrganizationMember addCreatorAsOwner(User owner, Organization org);

    // Get all members of an organization
    List<OrganizationMember> getMembersByOrganization(Long organizationId);

    // Get all organizations a user belongs to
    List<OrganizationMember> getOrganizationsByUser(Long userId);

    // Get a specific member by org + user
    OrganizationMember getMember(Long organizationId, Long userId);

    // Update role of a member
    OrganizationMember updateMemberRole(Long organizationId, Long userId, OrganizationRole role);

    // Soft delete member
    void removeMember(Long organizationId, Long userId);
}
