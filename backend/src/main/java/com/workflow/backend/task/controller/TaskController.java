package com.workflow.backend.task.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.workflow.backend.task.entity.Task;
import com.workflow.backend.task.service.TaskService;
import com.workflow.backend.task.utility.TaskStatus;

import java.util.List;

@RestController
@RequestMapping("/organizations/{orgId}/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    @PreAuthorize("@orgSecurity.isMember(#orgId, authentication)")
    public ResponseEntity<List<Task>> getAllTasks(@PathVariable Long orgId) {
        return ResponseEntity.ok(taskService.getTasksByOrganization(orgId));
    }

    @PostMapping
    @PreAuthorize("@orgSecurity.hasRole(#orgId, T(com.workflow.backend.organization.utility.OrganizationRole).MANAGER, authentication) "
            +
            "or @orgSecurity.hasRole(#orgId, T(com.workflow.backend.organization.utility.OrganizationRole).ADMIN, authentication)")
    public ResponseEntity<Task> createTask(
            @PathVariable Long orgId,
            @RequestBody Task task) {

        return ResponseEntity.ok(taskService.createTask(orgId, task));
    }

    @GetMapping("/created/{userId}")
    @PreAuthorize("@orgSecurity.isMember(#orgId, authentication)")
    public ResponseEntity<List<Task>> getTasksByCreator(
            @PathVariable Long orgId,
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                taskService.getTasksByCreatorInOrganization(orgId, userId));
    }

    @GetMapping("/assigned/{userId}")
    @PreAuthorize("@orgSecurity.isMember(#orgId, authentication)")
    public ResponseEntity<List<Task>> getTasksByAssignee(
            @PathVariable Long orgId,
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                taskService.getTasksByAssigneeInOrganization(orgId, userId));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("@orgSecurity.isMember(#orgId, authentication)")
    public ResponseEntity<List<Task>> getTasksByStatus(
            @PathVariable Long orgId,
            @PathVariable TaskStatus status) {

        return ResponseEntity.ok(
                taskService.getTasksByStatusInOrganization(orgId, status));
    }

    // =========================
    // Update Task Status (Members)
    // =========================
    @PatchMapping("/{taskId}/status")
    @PreAuthorize("@orgSecurity.isMember(#orgId, authentication)")
    public ResponseEntity<Task> updateTaskStatus(
            @PathVariable Long orgId,
            @PathVariable Long taskId,
            @RequestParam TaskStatus newStatus) {

        return ResponseEntity.ok(
                taskService.updateTaskStatus(orgId, taskId, newStatus));
    }

    // =========================
    // Assign Task (Manager/Admin)
    // =========================
    @PatchMapping("/{taskId}/assign")
    @PreAuthorize("@orgSecurity.hasRole(#orgId, T(com.workflow.backend.organization.utility.OrganizationRole).MANAGER, authentication) "
            +
            "or @orgSecurity.hasRole(#orgId, T(com.workflow.backend.organization.utility.OrganizationRole).ADMIN, authentication)")
    public ResponseEntity<Task> assignTask(
            @PathVariable Long orgId,
            @PathVariable Long taskId,
            @RequestParam Long userId) {

        return ResponseEntity.ok(
                taskService.assignTask(orgId, taskId, userId));
    }
}