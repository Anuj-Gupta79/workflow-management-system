package com.workflow.backend.task.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.workflow.backend.task.entity.Task;
import com.workflow.backend.task.service.TaskService;
import com.workflow.backend.task.utility.TaskStatus;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

@RestController
@RequestMapping("/organizations/{orgId}/tasks")
@RequiredArgsConstructor
@Tag(name = "Tasks", description = "Task management within organization")
@SecurityRequirement(name = "bearerAuth")
public class TaskController {

        private final TaskService taskService;

        @GetMapping
        @Operation(summary = "Get all tasks in organization")
        @PreAuthorize("@orgSecurity.isMember(#orgId, authentication)")
        public ResponseEntity<List<Task>> getAllTasks(@PathVariable Long orgId) {
                return ResponseEntity.ok(taskService.getTasksByOrganization(orgId));
        }

        @PostMapping
        @Operation(summary = "Create task")
        @PreAuthorize("@orgSecurity.isMember(#orgId, authentication)")
        public ResponseEntity<Task> createTask(
                        @PathVariable Long orgId,
                        @RequestBody Task task) {

                return ResponseEntity.ok(taskService.createTask(orgId, task));
        }

        @GetMapping("/created/{userId}")
        @Operation(summary = "Get tasks by creator")
        @PreAuthorize("@orgSecurity.isMember(#orgId, authentication)")
        public ResponseEntity<List<Task>> getTasksByCreator(
                        @PathVariable Long orgId,
                        @PathVariable Long userId) {

                return ResponseEntity.ok(
                                taskService.getTasksByCreatorInOrganization(orgId, userId));
        }

        @GetMapping("/assigned/{userId}")
        @Operation(summary = "Get tasks by assignee")
        @PreAuthorize("@orgSecurity.isMember(#orgId, authentication)")
        public ResponseEntity<List<Task>> getTasksByAssignee(
                        @PathVariable Long orgId,
                        @PathVariable Long userId) {

                return ResponseEntity.ok(
                                taskService.getTasksByAssigneeInOrganization(orgId, userId));
        }

        @GetMapping("/status/{status}")
        @Operation(summary = "Get tasks by status")
        @PreAuthorize("@orgSecurity.isMember(#orgId, authentication)")
        public ResponseEntity<List<Task>> getTasksByStatus(
                        @PathVariable Long orgId,
                        @PathVariable TaskStatus status) {

                return ResponseEntity.ok(
                                taskService.getTasksByStatusInOrganization(orgId, status));
        }

        @Operation(summary = "Update task status")
        @PatchMapping("/{taskId}/status")
        @PreAuthorize("@orgSecurity.isMember(#orgId, authentication)")
        public ResponseEntity<Task> updateTaskStatus(
                        @PathVariable Long orgId,
                        @PathVariable Long taskId,
                        @RequestParam TaskStatus newStatus) {

                return ResponseEntity.ok(
                                taskService.updateTaskStatus(orgId, taskId, newStatus));
        }

        @Operation(summary = "Assign task to user")
        @PatchMapping("/{taskId}/assign")
        @PreAuthorize("@orgSecurity.isMember(#orgId, authentication)")
        public ResponseEntity<Task> assignTask(
                        @PathVariable Long orgId,
                        @PathVariable Long taskId,
                        @RequestParam Long userId) {

                return ResponseEntity.ok(
                                taskService.assignTask(orgId, taskId, userId));
        }
}