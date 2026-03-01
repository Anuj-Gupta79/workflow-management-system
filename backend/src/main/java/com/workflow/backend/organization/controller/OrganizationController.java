package com.workflow.backend.organization.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.workflow.backend.organization.entity.Organization;
import com.workflow.backend.organization.service.OrganizationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/organizations")
@RequiredArgsConstructor
public class OrganizationController {
    private final OrganizationService organizationService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Organization> createOrganization(@RequestBody Organization organization) {
        return ResponseEntity.ok(organizationService.createOrganization(organization));
    }

    @GetMapping("/{id}")
    @PreAuthorize("@orgSecurity.isMember(#id, authentication)")
    public ResponseEntity<Organization> getOrganization(@PathVariable Long id) {
        return ResponseEntity.ok(organizationService.getOrganizationById(id));
    }

    @GetMapping("")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<List<Organization>> getAllOrganizations() {
        return ResponseEntity.ok(organizationService.getAllOrganizations());
    }

    @GetMapping("/owner/{ownerId}")
    @PreAuthorize("hasRole('MASTER_ADMIN') or #ownerId == authentication.principal.id")
    public ResponseEntity<List<Organization>> getOrganizationsByOwner(@PathVariable Long ownerId) {
        return ResponseEntity.ok(organizationService.getOrganizationsByOwner(ownerId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("@orgSecurity.hasRole(#id, T(com.workflow.backend.organization.utility.OrganizationRole).OWNER, authentication) "
            +
            "or @orgSecurity.hasRole(#id, T(com.workflow.backend.organization.utility.OrganizationRole).ADMIN, authentication)")
    public ResponseEntity<Organization> updateOrganization(@PathVariable Long id, @RequestBody Organization org) {
        return ResponseEntity.ok(organizationService.updateOrganization(id, org));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@orgSecurity.hasRole(#id, T(com.workflow.backend.organization.utility.OrganizationRole).OWNER, authentication)")
    public ResponseEntity<Void> deleteOrganization(@PathVariable Long id) {
        organizationService.deleteOrganization(id);
        return ResponseEntity.noContent().build();
    }
}
