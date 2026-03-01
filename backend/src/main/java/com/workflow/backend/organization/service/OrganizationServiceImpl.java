package com.workflow.backend.organization.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.workflow.backend.organization.entity.Organization;
import com.workflow.backend.organization.repository.OrganizationRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class OrganizationServiceImpl implements OrganizationService {

    private final OrganizationRepository organizationRepository;

    @Override
    public Organization createOrganization(Organization organization) {

        if (organization.getName() == null || organization.getName().isBlank()) {
            throw new RuntimeException("Organization name cannot be empty");
        }

        organization.setDeleted(false);

        return organizationRepository.save(organization);
    }

    @Override
    public Organization getOrganizationById(Long id) {

        return organizationRepository
                .findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Organization not found with id: " + id));
    }

    @Override
    public List<Organization> getAllOrganizations() {
        return organizationRepository.findByDeletedFalse();
    }

    @Override
    public List<Organization> getOrganizationsByOwner(Long ownerId) {
        return organizationRepository.findByOwnerIdAndDeletedFalse(ownerId);
    }

    @Override
    public void deleteOrganization(Long id) {

        Organization org = getOrganizationById(id);

        if (org.isDeleted()) {
            throw new RuntimeException("Organization already deleted");
        }

        org.setDeleted(true);
        organizationRepository.save(org);
    }

    @Override
    public Organization updateOrganization(Long id, Organization updatedOrg) {

        Organization org = getOrganizationById(id);

        if (updatedOrg.getName() != null && !updatedOrg.getName().isBlank()) {
            org.setName(updatedOrg.getName());
        }

        return organizationRepository.save(org);
    }
}