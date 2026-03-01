package com.workflow.backend.security;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import com.workflow.backend.organization.repository.OrganizationMemberRepository;
import com.workflow.backend.organization.utility.OrganizationRole;
import com.workflow.backend.user.entity.User;
import com.workflow.backend.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Component("orgSecurity")
@RequiredArgsConstructor
public class OrganizationSecurityService {

    private final OrganizationMemberRepository memberRepository;
    private final UserRepository userRepository;

    public boolean isMember(Long orgId, Authentication authentication) {

        String email = authentication.getName();
        User user = userRepository.findByEmailAndDeletedFalse(email).orElse(null);

        if (user == null)
            return false;

        return memberRepository
                .findByOrganizationIdAndUserIdAndDeletedFalse(user.getId(), orgId)
                .isPresent();
    }

    public boolean hasRole(Long orgId, OrganizationRole requiredRole, Authentication authentication) {

        String email = authentication.getName();
        User user = userRepository.findByEmailAndDeletedFalse(email).orElse(null);

        if (user == null)
            return false;

        return memberRepository
                .findByOrganizationIdAndUserIdAndDeletedFalse(user.getId(), orgId)
                .map(member -> isHigherOrEqual(member.getRole(), requiredRole))
                .orElse(false);
    }

    private boolean isHigherOrEqual(OrganizationRole actual, OrganizationRole required) {

        // Define hierarchy
        return switch (actual) {
            case OWNER -> true;
            case ADMIN -> required != OrganizationRole.OWNER;
            case MANAGER -> required == OrganizationRole.MANAGER || required == OrganizationRole.EMPLOYEE;
            case EMPLOYEE -> required == OrganizationRole.EMPLOYEE;
        };
    }

}
