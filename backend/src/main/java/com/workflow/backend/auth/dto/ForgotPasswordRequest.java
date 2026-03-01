package com.workflow.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class ForgotPasswordRequest {

    @NotBlank
    @Email(message = "Invalid email format")
    private String email;
}
