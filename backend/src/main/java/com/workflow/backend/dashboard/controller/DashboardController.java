package com.workflow.backend.dashboard.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.workflow.backend.dashboard.dto.DashboardStats;
import com.workflow.backend.dashboard.dto.RecentTask;
import com.workflow.backend.dashboard.service.DashboardService;

import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("/organizations/{orgId}/dashboard")
public class DashboardController {
    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public DashboardStats getStats(
            @PathVariable Long orgId,
            @AuthenticationPrincipal(expression = "id") Long userId) {
        return dashboardService.getStats(orgId, userId);
    }

    @GetMapping("/recent-tasks")
    public List<RecentTask> getRecentTasks(
            @PathVariable Long orgId) {
        return dashboardService.getRecentTasks(orgId);
    }
}
