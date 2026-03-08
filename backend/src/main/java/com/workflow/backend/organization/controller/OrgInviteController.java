package com.workflow.backend.organization.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.workflow.backend.organization.dto.InviteRequest;
import com.workflow.backend.organization.entity.OrgInvite;
import com.workflow.backend.organization.service.OrgInviteService;
import com.workflow.backend.shared.utility.CustomUserDetails;
import com.workflow.backend.user.entity.User;
import com.workflow.backend.user.repository.UserRepository;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
@RequestMapping("/invites")
@RequiredArgsConstructor
@Tag(name = "Invites", description = "Organization invite management")
@SecurityRequirement(name = "bearerAuth")
public class OrgInviteController {

    private final OrgInviteService inviteService;
    private final UserRepository userRepository;

    // Public — no auth needed, just a token
    @GetMapping("/validate")
    public ResponseEntity<OrgInvite> validateInvite(@RequestParam String token) {
        return ResponseEntity.ok(inviteService.validateToken(token));
    }

    @PostMapping("/accept")
    public ResponseEntity<OrgInvite> acceptInvite(
            @RequestParam String token,
            @AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(inviteService.acceptInvite(token, principal.getId()));
    }

    @PostMapping
    @PreAuthorize("@orgSecurity.hasRole(#request.organizationId, T(com.workflow.backend.organization.utility.OrganizationRole).ADMIN, authentication)")
    public ResponseEntity<OrgInvite> sendInvite(
            @RequestBody @Valid InviteRequest request,
            @AuthenticationPrincipal CustomUserDetails principal) {

        User invitedBy = userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(
                inviteService.createInvite(
                        request.getOrganizationId(),
                        request.getEmail(),
                        request.getRole(),
                        invitedBy));
    }

    @PostMapping("/decline")
    public ResponseEntity<OrgInvite> declineInvite(
            @RequestParam String token,
            @AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(inviteService.declineInvite(token, principal.getId()));
    }
}