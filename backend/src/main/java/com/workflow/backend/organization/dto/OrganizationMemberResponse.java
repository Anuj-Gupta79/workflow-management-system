package com.workflow.backend.organization.dto;

import com.workflow.backend.organization.entity.OrganizationMember;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrganizationMemberResponse {

    private Long userId;
    private String role;

    public OrganizationMemberResponse(OrganizationMember member) {
        this.userId = member.getUser().getId();
        this.role = member.getRole().name();
    }
}