package com.workflow.backend.task.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.workflow.backend.task.entity.Task;
import com.workflow.backend.task.utility.TaskStatus;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByOrganizationIdAndDeletedFalse(Long organizationId);

    List<Task> findByOrganizationIdAndCreatedByIdAndDeletedFalse(Long orgId, Long userId);

    List<Task> findByOrganizationIdAndAssignedToIdAndDeletedFalse(Long orgId, Long userId);

    List<Task> findByOrganizationIdAndStatusAndDeletedFalse(Long orgId, TaskStatus status);

    Optional<Task> findByIdAndOrganizationIdAndDeletedFalse(Long taskId, Long orgId);

    long countByOrganizationIdAndDeletedFalse(Long orgId);

    long countByOrganizationIdAndStatusAndDeletedFalse(Long organizationId, TaskStatus status);

    long countByOrganizationIdAndAssignedToIdAndDeletedFalse(Long organizationId, Long userId);

    long countByOrganizationIdAndDueDateBeforeAndDeletedFalse(Long organizationId, LocalDateTime date);

    List<Task> findTop5ByOrganizationIdAndDeletedFalseOrderByCreatedAtDesc(Long organizationId);
}
