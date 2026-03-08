package com.workflow.backend.organization.service;

import com.workflow.backend.organization.entity.OrgInvite;
import com.workflow.backend.organization.utility.OrganizationRole;
import com.workflow.backend.user.entity.User;

public interface OrgInviteService {
    OrgInvite createInvite(Long orgId, String email, OrganizationRole role, User inviter);

    OrgInvite validateToken(String token);

    OrgInvite acceptInvite(String token, Long userId);

    OrgInvite declineInvite(String token, Long userId);
}