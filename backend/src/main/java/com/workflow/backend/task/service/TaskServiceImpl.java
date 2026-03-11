package com.workflow.backend.task.service;

import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.workflow.backend.notification.entity.Notification.NotificationType;
import com.workflow.backend.notification.service.NotificationService;
import com.workflow.backend.organization.repository.OrganizationMemberRepository;
import com.workflow.backend.organization.repository.OrganizationRepository;
import com.workflow.backend.shared.utility.CustomUserDetails;
import com.workflow.backend.task.dto.TaskRequest;
import com.workflow.backend.task.entity.Task;
import com.workflow.backend.task.repository.TaskRepository;
import com.workflow.backend.task.utility.TaskPriority;
import com.workflow.backend.task.utility.TaskStatus;
import com.workflow.backend.user.entity.User;
import com.workflow.backend.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final OrganizationMemberRepository memberRepository;
    private final NotificationService notificationService;

    @Override
    public List<Task> getTasksByOrganization(Long orgId) {
        return taskRepository.findByOrganizationIdAndDeletedFalse(orgId);
    }

    @Override
    public Task createTask(Long orgId, TaskRequest request) {

        var organization = organizationRepository
                .findByIdAndDeletedFalse(orgId)
                .orElseThrow(() -> new RuntimeException("Organization not found"));

        User currentUser = getCurrentUser();

        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setOrganization(organization);
        task.setCreatedBy(currentUser);
        task.setDeleted(false);
        task.setStatus(TaskStatus.TO_DO);

        // Default priority if not provided
        task.setPriority(
                request.getPriority() != null
                        ? TaskPriority.valueOf(request.getPriority())
                        : TaskPriority.MEDIUM);

        // Optional assignee
        if (request.getAssignedTo() != null) {
            memberRepository
                    .findByOrganizationIdAndUserIdAndDeletedFalse(orgId, request.getAssignedTo())
                    .orElseThrow(() -> new RuntimeException("Assigned user not part of organization"));

            User assignedUser = userRepository.findById(request.getAssignedTo())
                    .orElseThrow(() -> new RuntimeException("Assigned user not found"));

            task.setAssignedTo(assignedUser);
        }

        return taskRepository.save(task);
    }

    @Override
    public List<Task> getTasksByCreatorInOrganization(Long orgId, Long userId) {
        return taskRepository
                .findByOrganizationIdAndCreatedByIdAndDeletedFalse(orgId, userId);
    }

    @Override
    public List<Task> getTasksByAssigneeInOrganization(Long orgId, Long userId) {
        return taskRepository
                .findByOrganizationIdAndAssignedToIdAndDeletedFalse(orgId, userId);
    }

    @Override
    public List<Task> getTasksByStatusInOrganization(Long orgId, TaskStatus status) {
        return taskRepository
                .findByOrganizationIdAndStatusAndDeletedFalse(orgId, status);
    }

    @Override
    public Task updateTaskStatus(Long orgId, Long taskId, TaskStatus newStatus) {

        Task task = taskRepository
                .findByIdAndOrganizationIdAndDeletedFalse(taskId, orgId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (!isValidTransition(task.getStatus(), newStatus)) {
            throw new RuntimeException(
                    "Invalid status transition from "
                            + task.getStatus() + " to " + newStatus);
        }

        task.setStatus(newStatus);
        return taskRepository.save(task);
    }

    @Override
    public Task assignTask(Long orgId, Long taskId, Long userId) {

        Task task = taskRepository
                .findByIdAndOrganizationIdAndDeletedFalse(taskId, orgId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        memberRepository
                .findByOrganizationIdAndUserIdAndDeletedFalse(orgId, userId)
                .orElseThrow(() -> new RuntimeException("User not part of organization"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        task.setAssignedTo(user);
        Task saved = taskRepository.save(task);

        User currentUser = getCurrentUser();
        if (!user.getId().equals(currentUser.getId())) {
            notificationService.createAndPush(
                    user,
                    "You have been assigned a new task: \"" + task.getTitle() + "\"",
                    NotificationType.TASK_ASSIGNED);
        }

        return saved;
    }

    @Override
    public long countTasksByOrganization(Long orgId) {
        return taskRepository.countByOrganizationIdAndDeletedFalse(orgId);
    }

    @Override
    public List<Task> getPendingTasksByOrganization(Long orgId) {
        return taskRepository.findByOrganizationIdAndStatusAndDeletedFalse(orgId, TaskStatus.PENDING);
    }

    @Override
    public Task approveTask(Long orgId, Long taskId) {
        Task task = taskRepository
                .findByIdAndOrganizationIdAndDeletedFalse(taskId, orgId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (task.getStatus() != TaskStatus.PENDING && task.getStatus() != TaskStatus.COMPLETED) {
            throw new RuntimeException("Only PENDING or COMPLETED tasks can be approved");
        }

        task.setStatus(TaskStatus.APPROVED);
        task.setRejectionReason(null);
        Task saved = taskRepository.save(task);

        if (task.getCreatedBy() != null) {
            notificationService.createAndPush(
                    task.getCreatedBy(),
                    "Your task \"" + task.getTitle() + "\" has been approved! ✅",
                    NotificationType.TASK_APPROVED);
        }

        return saved;
    }

    @Override
    public Task rejectTask(Long orgId, Long taskId, String reason) {
        Task task = taskRepository
                .findByIdAndOrganizationIdAndDeletedFalse(taskId, orgId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (task.getStatus() != TaskStatus.PENDING && task.getStatus() != TaskStatus.COMPLETED) {
            throw new RuntimeException("Only PENDING or COMPLETED tasks can be rejected");
        }

        task.setStatus(TaskStatus.REJECTED);
        task.setRejectionReason(reason);
        Task saved = taskRepository.save(task);

        // Notify task creator
        if (task.getCreatedBy() != null) {
            String msg = reason != null && !reason.isBlank()
                    ? "Your task \"" + task.getTitle() + "\" was rejected. Reason: " + reason
                    : "Your task \"" + task.getTitle() + "\" has been rejected.";

            notificationService.createAndPush(
                    task.getCreatedBy(),
                    msg,
                    NotificationType.TASK_REJECTED);
        }

        return saved;
    }

    private boolean isValidTransition(TaskStatus current, TaskStatus next) {

        if (current == next)
            return true;

        switch (current) {

            case TO_DO:
                return next == TaskStatus.IN_PROGRESS
                        || next == TaskStatus.CANCELLED;

            case IN_PROGRESS:
                return next == TaskStatus.PENDING
                        || next == TaskStatus.COMPLETED
                        || next == TaskStatus.ON_HOLD
                        || next == TaskStatus.CANCELLED;

            case PENDING:
                return next == TaskStatus.IN_PROGRESS
                        || next == TaskStatus.APPROVED
                        || next == TaskStatus.REJECTED;

            case COMPLETED:
                return next == TaskStatus.APPROVED
                        || next == TaskStatus.REJECTED;

            case REJECTED:
                return next == TaskStatus.IN_PROGRESS;

            case ON_HOLD:
                return next == TaskStatus.IN_PROGRESS
                        || next == TaskStatus.CANCELLED;

            case APPROVED:
                return next == TaskStatus.ARCHIVED;

            case CANCELLED:
            case ARCHIVED:
                return false;

            default:
                return false;
        }
    }

    private User getCurrentUser() {
        CustomUserDetails principal = (CustomUserDetails) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }
}