package com.workflow.backend.admin.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.workflow.backend.task.TaskService;
import com.workflow.backend.task.TaskStatus;
import com.workflow.backend.user.UserService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;
    private final TaskService taskService;

    @GetMapping("/stats")
    public Map<String, Object> getSate() {
        
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalUsers", userService.countUsers());
        stats.put("totalTasks", taskService.countTasks());
        stats.put("completedTasks", taskService.getTasksByStatus(TaskStatus.COMPLETED).size());
        stats.put("pendingTasks", taskService.getTasksByStatus(TaskStatus.PENDING).size());
        stats.put("inProgressTasks", taskService.getTasksByStatus(TaskStatus.IN_PROGRESS).size());

        return stats;
    }

}
