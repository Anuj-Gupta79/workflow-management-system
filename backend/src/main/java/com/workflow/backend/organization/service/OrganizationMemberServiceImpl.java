package com.workflow.backend.organization.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.workflow.backend.organization.dto.AddMemberRequest;
import com.workflow.backend.organization.entity.Organization;
import com.workflow.backend.organization.entity.OrganizationMember;
import com.workflow.backend.organization.repository.OrganizationMemberRepository;
import com.workflow.backend.organization.repository.OrganizationRepository;
import com.workflow.backend.organization.utility.OrganizationRole;
import com.workflow.backend.user.entity.User;
import com.workflow.backend.user.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;

@Service
@Transactional
@AllArgsConstructor
public class OrganizationMemberServiceImpl implements OrganizationMemberService {

    private final OrganizationMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;

    @Override
    public OrganizationMember addMember(AddMemberRequest request) {

        Organization org = organizationRepository
                .findByIdAndDeletedFalse(request.getOrganizationId())
                .orElseThrow(() -> new RuntimeException("Organization not found"));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean exists = memberRepository
                .findByOrganizationIdAndUserIdAndDeletedFalse(org.getId(), user.getId())
                .isPresent();

        if (exists)
            throw new RuntimeException("User already a member of this organization");

        if (request.getRole() == OrganizationRole.OWNER)
            throw new RuntimeException("Cannot assign OWNER role directly");

        OrganizationMember member = new OrganizationMember();
        member.setOrganization(org);
        member.setUser(user);
        member.setRole(request.getRole());
        member.setDeleted(false);

        return memberRepository.save(member);
    }

    @Override
    public OrganizationMember addCreatorAsOwner(User owner, Organization org) {
        OrganizationMember member = new OrganizationMember();
        member.setOrganization(org);
        member.setUser(owner);
        member.setRole(OrganizationRole.OWNER); // allow OWNER here only
        return memberRepository.save(member);
    }

    @Override
    public List<OrganizationMember> getMembersByOrganization(Long organizationId) {
        return memberRepository.findByOrganizationIdAndDeletedFalse(organizationId);
    }

    @Override
    public List<OrganizationMember> getOrganizationsByUser(Long userId) {
        return memberRepository.findByUserId(userId);
    }

    @Override
    public OrganizationMember getMember(Long organizationId, Long userId) {
        return memberRepository
                .findByOrganizationIdAndUserIdAndDeletedFalse(organizationId, userId)
                .orElseThrow(() -> new RuntimeException("Member not found"));
    }

    @Override
    public OrganizationMember updateMemberRole(Long organizationId, Long userId, OrganizationRole newRole) {

        OrganizationMember member = getMember(organizationId, userId);

        if (member.getRole() == OrganizationRole.OWNER) {
            throw new RuntimeException("Cannot change role of OWNER");
        }

        if (newRole == OrganizationRole.OWNER) {
            throw new RuntimeException("Cannot promote user to OWNER");
        }

        member.setRole(newRole);
        return memberRepository.save(member);
    }

    @Override
    public void removeMember(Long organizationId, Long userId) {

        OrganizationMember member = getMember(organizationId, userId);

        if (member.getRole() == OrganizationRole.OWNER) {
            throw new RuntimeException("Cannot remove OWNER from organization");
        }

        member.setDeleted(true);
        memberRepository.save(member);
    }
}