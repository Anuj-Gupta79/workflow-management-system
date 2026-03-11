package com.workflow.backend.notification.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.workflow.backend.notification.entity.Notification;
import com.workflow.backend.notification.service.NotificationService;
import com.workflow.backend.security.JwtService;
import com.workflow.backend.shared.utility.CustomUserDetails;
import com.workflow.backend.user.entity.User;
import com.workflow.backend.user.repository.UserRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "In-app notification APIs")
@SecurityRequirement(name = "bearerAuth")
public class NotificationController {

    private final NotificationService notificationService;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Operation(summary = "Subscribe to SSE notification stream")
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    // No @PreAuthorize — token passed as query param, validated manually below
    public SseEmitter stream(@RequestParam String token) {
        try {
            String email = jwtService.extractEmail(token);
            User user = userRepository.findByEmailAndDeletedFalse(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            CustomUserDetails userDetails = new CustomUserDetails(
                    user.getId(), user.getEmail(), user.getPassword(), java.util.List.of());

            if (!jwtService.isValidToken(token, userDetails)) {
                throw new RuntimeException("Invalid token");
            }

            return notificationService.subscribe(user.getId());

        } catch (Exception e) {
            // Return a completed emitter on auth failure
            SseEmitter emitter = new SseEmitter();
            emitter.complete();
            return emitter;
        }
    }

    @Operation(summary = "Get all notifications for current user")
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Notification>> getMyNotifications(
            @AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(
                notificationService.getNotificationsForUser(principal.getId()));
    }

    @Operation(summary = "Mark a notification as read")
    @PutMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Notification> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(
                notificationService.markAsRead(id, principal.getId()));
    }

    @Operation(summary = "Mark all notifications as read")
    @PutMapping("/me/read-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> markAllAsRead(
            @AuthenticationPrincipal CustomUserDetails principal) {
        notificationService.markAllAsRead(principal.getId());
        return ResponseEntity.noContent().build();
    }
}