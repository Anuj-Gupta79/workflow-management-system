package com.workflow.backend.user.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.workflow.backend.user.dto.UserRequest;
import com.workflow.backend.user.dto.UserResponse;
import com.workflow.backend.user.service.UserServiceImpl;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserServiceImpl userService;

    @GetMapping
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {

        return ResponseEntity.ok(
                userService.getAllUsers()
                        .stream()
                        .map(UserResponse::new)
                        .toList());
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> getMyProfile(Authentication authentication) {

        return ResponseEntity.ok(
                userService.getCurrentUser(authentication));
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> updateMyProfile(
            Authentication authentication,
            @RequestBody UserRequest request) {

        return ResponseEntity.ok(
                userService.updateProfile(authentication, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long id,
            Authentication authentication) {

        userService.deleteUser(id, authentication);
        return ResponseEntity.noContent().build();
    }
}