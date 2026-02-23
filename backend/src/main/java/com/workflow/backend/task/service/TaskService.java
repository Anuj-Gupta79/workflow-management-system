package com.workflow.backend.task.service;

import java.util.List;

import com.workflow.backend.task.entity.Task;
import com.workflow.backend.task.utility.TaskStatus;

public interface TaskService {

    public List<Task> getAllTasks();

    public Task createTask(Task task);

    public List<Task> getTasksByCreator(Long userId);

    public List<Task> getTasksByAssignee(Long userId);

    public List<Task> getTasksByStatus(TaskStatus status);

    public Task updateTaskStatus(Long taskId, TaskStatus newStatus);

    public Task assignTask(Long taskId, Long userId);

    public long countTasks();

}
