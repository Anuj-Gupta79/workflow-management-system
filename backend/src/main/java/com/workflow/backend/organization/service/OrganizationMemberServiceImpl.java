package com.workflow.backend.organization.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.workflow.backend.organization.entity.OrganizationMember;
import com.workflow.backend.organization.repository.OrganizationMemberRepository;
import com.workflow.backend.organization.utility.OrganizationRole;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;

@Service
@Transactional
@AllArgsConstructor
public class OrganizationMemberServiceImpl implements OrganizationMemberService {

    private final OrganizationMemberRepository memberRepository;

    @Override
    public OrganizationMember addMember(OrganizationMember member) {

        boolean exists = memberRepository
                .findByOrganizationIdAndUserIdAndDeletedFalse(member.getOrganization().getId(),
                        member.getUser().getId())
                .isPresent();

        if (exists) {
            throw new RuntimeException("User already a member of this organization");
        }

        if (member.getRole() == OrganizationRole.OWNER) {
            throw new RuntimeException("Cannot assign OWNER role directly");
        }

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