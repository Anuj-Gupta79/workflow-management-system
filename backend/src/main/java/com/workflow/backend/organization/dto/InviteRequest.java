package com.workflow.backend.organization.dto;

import com.workflow.backend.organization.utility.OrganizationRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InviteRequest {

    @NotNull
    private Long organizationId;

    @NotBlank
    @Email
    private String email;

    @NotNull
    private OrganizationRole role;
}