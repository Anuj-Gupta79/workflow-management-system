package com.workflow.backend.organization.dto;

import com.workflow.backend.organization.utility.OrganizationRole;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddMemberRequest {

    @NotNull
    private Long organizationId;

    @NotNull
    private Long userId;

    @NotNull
    private OrganizationRole role;
}