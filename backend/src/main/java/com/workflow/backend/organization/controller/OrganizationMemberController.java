package com.workflow.backend.organization.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.workflow.backend.organization.entity.OrganizationMember;
import com.workflow.backend.organization.service.OrganizationMemberService;
import com.workflow.backend.organization.utility.OrganizationRole;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/organization-members")
@RequiredArgsConstructor
public class OrganizationMemberController {
    private final OrganizationMemberService memberService;

    @PostMapping
    @PreAuthorize("@orgSecurity.hasRole(#member.organization.id, T(com.workflow.backend.organization.utility.OrganizationRole).ADMIN, authentication)")
    public ResponseEntity<OrganizationMember> addMember(@RequestBody OrganizationMember member) {
        return ResponseEntity.ok(memberService.addMember(member));
    }

    @GetMapping("/organization/{orgId}")
    @PreAuthorize("@orgSecurity.isMember(#orgId, authentication)")
    public ResponseEntity<List<OrganizationMember>> getMembersByOrganization(@PathVariable Long orgId) {
        return ResponseEntity.ok(memberService.getMembersByOrganization(orgId));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('MASTER_ADMIN') or #userId == authentication.principal.id")
    public ResponseEntity<List<OrganizationMember>> getOrganizationsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(memberService.getOrganizationsByUser(userId));
    }

    @GetMapping("/organization/{orgId}/user/{userId}")
    @PreAuthorize("@orgSecurity.isMember(#orgId, authentication)")
    public ResponseEntity<OrganizationMember> getMember(@PathVariable Long orgId, @PathVariable Long userId) {
        return ResponseEntity.ok(memberService.getMember(orgId, userId));
    }

    @PatchMapping("/organization/{orgId}/user/{userId}/role")
    @PreAuthorize("@orgSecurity.hasRole(#orgId, T(com.workflow.backend.organization.utility.OrganizationRole).ADMIN, authentication)")
    public ResponseEntity<OrganizationMember> updateRole(@PathVariable Long orgId, @PathVariable Long userId,
            @RequestParam OrganizationRole role) {
        return ResponseEntity.ok(memberService.updateMemberRole(orgId, userId, role));
    }

    @DeleteMapping("/organization/{orgId}/user/{userId}")
    @PreAuthorize("@orgSecurity.hasRole(#orgId, T(com.workflow.backend.organization.utility.OrganizationRole).ADMIN, authentication)")
    public ResponseEntity<Void> removeMember(@PathVariable Long orgId, @PathVariable Long userId) {
        memberService.removeMember(orgId, userId);
        return ResponseEntity.noContent().build();
    }
}
