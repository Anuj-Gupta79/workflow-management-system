package com.workflow.backend.dashboard.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.workflow.backend.dashboard.dto.DashboardStats;
import com.workflow.backend.dashboard.dto.RecentTask;
import com.workflow.backend.organization.repository.OrganizationMemberRepository;
import com.workflow.backend.task.entity.Task;
import com.workflow.backend.task.repository.TaskRepository;
import com.workflow.backend.task.utility.TaskStatus;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final TaskRepository taskRepository;
    private final OrganizationMemberRepository memberRepository;

    public DashboardStats getStats(Long orgId, Long userId) {

        long totalTasks = taskRepository.countByOrganizationIdAndDeletedFalse(orgId);

        long completed = taskRepository.countByOrganizationIdAndStatusAndDeletedFalse(
                orgId, TaskStatus.COMPLETED);

        long pending = taskRepository.countByOrganizationIdAndStatusAndDeletedFalse(
                orgId, TaskStatus.PENDING);

        long overdue = taskRepository.countByOrganizationIdAndDueDateBeforeAndDeletedFalse(
                orgId, LocalDateTime.now());

        long myTasks = taskRepository.countByOrganizationIdAndAssignedToIdAndDeletedFalse(
                orgId, userId);

        long members = memberRepository.countByOrganizationId(orgId);

        return DashboardStats.builder()
                .totalTasks(totalTasks)
                .completedTasks(completed)
                .pendingTasks(pending)
                .overdueTasks(overdue)
                .myTasks(myTasks)
                .totalMembers(members)
                .build();
    }

    public List<RecentTask> getRecentTasks(Long orgId) {

        return taskRepository
                .findTop5ByOrganizationIdAndDeletedFalseOrderByCreatedAtDesc(orgId)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    private RecentTask mapToDTO(Task task) {

        return RecentTask.builder()
                .id(task.getId())
                .title(task.getTitle())
                .status(task.getStatus().name())
                .priority(task.getPriority().name())
                .createdAt(task.getCreatedAt())
                .build();
    }

}
