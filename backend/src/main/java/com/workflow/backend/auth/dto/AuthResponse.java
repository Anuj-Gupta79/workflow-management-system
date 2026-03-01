package com.workflow.backend.auth.dto;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Builder
@Getter
@Setter
public class AuthResponse {
    private Long userId;
    private String token;
    private String name;
    private String email;
    private String role;
}
