package com.workflow.backend.user.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.workflow.backend.user.dto.ChangePasswordRequest;
import com.workflow.backend.user.dto.UserRequest;
import com.workflow.backend.user.dto.UserResponse;
import com.workflow.backend.user.service.UserServiceImpl;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management APIs")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserServiceImpl userService;

    @Operation(summary = "Get all users (MASTER_ADMIN only)")
    @GetMapping
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {

        return ResponseEntity.ok(
                userService.getAllUsers()
                        .stream()
                        .map(UserResponse::new)
                        .toList());
    }

    @Operation(summary = "Get current logged-in user profile")
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> getMyProfile(Authentication authentication) {

        return ResponseEntity.ok(
                userService.getCurrentUser(authentication));
    }

    @Operation(summary = "Update current user profile")
    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> updateMyProfile(
            Authentication authentication,
            @RequestBody UserRequest request) {

        return ResponseEntity.ok(
                userService.updateProfile(authentication, request));
    }

    @Operation(summary = "Delete user by ID (MASTER_ADMIN only)")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long id,
            Authentication authentication) {

        userService.deleteUser(id, authentication);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Change current user password")
    @PutMapping("/me/password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> changePassword(
            Authentication authentication,
            @RequestBody @Valid ChangePasswordRequest request) {

        userService.changePassword(authentication, request);
        return ResponseEntity.noContent().build();
    }
}