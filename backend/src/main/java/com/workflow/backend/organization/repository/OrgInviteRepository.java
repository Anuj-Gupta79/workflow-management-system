package com.workflow.backend.organization.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.workflow.backend.organization.entity.OrgInvite;

public interface OrgInviteRepository extends JpaRepository<OrgInvite, Long> {
    Optional<OrgInvite> findByToken(String token);

    boolean existsByInviteeEmailAndOrganizationIdAndStatus(
            String email, Long orgId, OrgInvite.InviteStatus status);
}