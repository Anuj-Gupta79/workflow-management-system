package com.workflow.backend.organization.dto;

import com.workflow.backend.organization.entity.Organization;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrganizationResponse {

    private Long id;
    private String name;
    private Long ownerId;

    public OrganizationResponse(Organization org) {
        this.id = org.getId();
        this.name = org.getName();
        this.ownerId = org.getOwner().getId();
    }
}
