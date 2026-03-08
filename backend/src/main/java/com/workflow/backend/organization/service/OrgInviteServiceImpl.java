package com.workflow.backend.organization.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.workflow.backend.organization.entity.OrgInvite;
import com.workflow.backend.organization.entity.OrgInvite.InviteStatus;
import com.workflow.backend.organization.entity.OrganizationMember;
import com.workflow.backend.organization.repository.OrgInviteRepository;
import com.workflow.backend.organization.repository.OrganizationMemberRepository;
import com.workflow.backend.organization.repository.OrganizationRepository;
import com.workflow.backend.organization.utility.OrganizationRole;
import com.workflow.backend.shared.service.EmailService;
import com.workflow.backend.user.entity.User;
import com.workflow.backend.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrgInviteServiceImpl implements OrgInviteService {

    private final OrgInviteRepository inviteRepository;
    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Override
    public OrgInvite createInvite(Long orgId, String email, OrganizationRole role, User inviter) {

        var org = organizationRepository.findByIdAndDeletedFalse(orgId)
                .orElseThrow(() -> new RuntimeException("Organization not found"));

        // Check if already a member
        userRepository.findByEmailAndDeletedFalse(email).ifPresent(user -> {
            boolean isMember = memberRepository
                    .findByOrganizationIdAndUserIdAndDeletedFalse(orgId, user.getId())
                    .isPresent();
            if (isMember)
                throw new RuntimeException("User is already a member of this organization");
        });

        // Check if pending invite already exists
        boolean pendingExists = inviteRepository
                .existsByInviteeEmailAndOrganizationIdAndStatus(email, orgId, InviteStatus.PENDING);
        if (pendingExists)
            throw new RuntimeException("A pending invite already exists for this email");

        // Create token
        String token = UUID.randomUUID().toString();

        OrgInvite invite = new OrgInvite();
        invite.setToken(token);
        invite.setInviteeEmail(email);
        invite.setOrganization(org);
        invite.setRole(role);
        invite.setStatus(InviteStatus.PENDING);
        invite.setExpiryTime(LocalDateTime.now().plusHours(48));
        invite.setInvitedBy(inviter);

        inviteRepository.save(invite);

        // Send email
        String link = "http://localhost:4200/invite?token=" + token;
        emailService.sendInviteEmail(email, org.getName(), inviter.getName(), link);

        return invite;
    }

    @Override
    public OrgInvite validateToken(String token) {
        OrgInvite invite = inviteRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid invite token"));

        if (invite.getStatus() == InviteStatus.ACCEPTED)
            throw new RuntimeException("Invite already accepted");

        if (invite.getExpiryTime().isBefore(LocalDateTime.now())) {
            invite.setStatus(InviteStatus.EXPIRED);
            inviteRepository.save(invite);
            throw new RuntimeException("Invite has expired");
        }

        return invite;
    }

    @Override
    public OrgInvite acceptInvite(String token, Long userId) {
        OrgInvite invite = validateToken(token);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getEmail().equalsIgnoreCase(invite.getInviteeEmail()))
            throw new RuntimeException("This invite was sent to a different email address");

        OrganizationMember member = new OrganizationMember();
        member.setOrganization(invite.getOrganization());
        member.setUser(user);
        member.setRole(invite.getRole());
        member.setDeleted(false);
        memberRepository.save(member);

        invite.setStatus(InviteStatus.ACCEPTED);
        inviteRepository.save(invite);

        // Notify inviter
        emailService.sendInviteResponseEmail(
                invite.getInvitedBy().getEmail(),
                invite.getInvitedBy().getName(),
                user.getName(),
                invite.getOrganization().getName(),
                true);

        return invite;
    }

    @Override
    public OrgInvite declineInvite(String token, Long userId) {
        OrgInvite invite = validateToken(token);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getEmail().equalsIgnoreCase(invite.getInviteeEmail()))
            throw new RuntimeException("This invite was sent to a different email address");

        invite.setStatus(InviteStatus.DECLINED);
        inviteRepository.save(invite);

        // Notify inviter
        emailService.sendInviteResponseEmail(
                invite.getInvitedBy().getEmail(),
                invite.getInvitedBy().getName(),
                user.getName(),
                invite.getOrganization().getName(),
                false);

        return invite;
    }

}