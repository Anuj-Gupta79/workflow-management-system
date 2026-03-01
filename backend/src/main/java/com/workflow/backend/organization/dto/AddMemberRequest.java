package com.workflow.backend.organization.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddMemberRequest {

    private Long userId;
    private String role;
}
