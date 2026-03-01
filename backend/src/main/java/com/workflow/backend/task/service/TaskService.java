package com.workflow.backend.task.service;

import java.util.List;

import com.workflow.backend.task.entity.Task;
import com.workflow.backend.task.utility.TaskStatus;

public interface TaskService {

    List<Task> getTasksByOrganization(Long orgId);

    Task createTask(Long orgId, Task task);

    List<Task> getTasksByCreatorInOrganization(Long orgId, Long userId);

    List<Task> getTasksByAssigneeInOrganization(Long orgId, Long userId);

    List<Task> getTasksByStatusInOrganization(Long orgId, TaskStatus status);

    Task updateTaskStatus(Long orgId, Long taskId, TaskStatus newStatus);

    Task assignTask(Long orgId, Long taskId, Long userId);

    long countTasksByOrganization(Long orgId);

}
