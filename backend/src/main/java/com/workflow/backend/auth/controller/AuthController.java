package com.workflow.backend.auth.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.workflow.backend.auth.dto.AuthResponse;
import com.workflow.backend.auth.dto.ForgotPasswordRequest;
import com.workflow.backend.auth.dto.LoginRequest;
import com.workflow.backend.auth.dto.RegisterRequest;
import com.workflow.backend.auth.dto.ResetPasswordRequest;
import com.workflow.backend.auth.service.AuthService;
import com.workflow.backend.auth.service.ForgotPasswordService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin
@Tag(name = "Authentication", description = "User authentication APIs")
public class AuthController {

    private final AuthService authService;
    private final ForgotPasswordService forgotPasswordService;

    @Operation(summary = "Register new user")
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @Operation(summary = "Login user and receive JWT token")
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @Operation(summary = "Send forgot password reset link")
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        forgotPasswordService.sendResetLink(request.getEmail());
        return ResponseEntity.ok(Map.of("message", "Reset link sent"));
    }

    @Operation(summary = "Reset password using token")
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @RequestBody ResetPasswordRequest request) {

        forgotPasswordService.resetPassword(
                request.getToken(),
                request.getPassword());

        return ResponseEntity.ok(Map.of("message", "Password reset successful"));
    }
}
