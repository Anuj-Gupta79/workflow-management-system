package com.workflow.backend.organization.service;

import java.util.List;

import com.workflow.backend.organization.dto.OrganizationRequest;
import com.workflow.backend.organization.entity.Organization;

public interface OrganizationService {
    // Create a new organization
    Organization createOrganization(Organization organization);

    // Get organization by ID
    Organization getOrganizationById(Long id);

    // Get all organizations
    List<Organization> getAllOrganizations();

    // Get all organizations owned by a user
    List<Organization> getOrganizationsByOwner(Long ownerId);

    // Soft delete an organization
    void deleteOrganization(Long id);

    // Update organization details
    Organization updateOrganization(Long id, OrganizationRequest updatedOrg);
}
