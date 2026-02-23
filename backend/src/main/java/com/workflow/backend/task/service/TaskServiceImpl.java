package com.workflow.backend.task.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.workflow.backend.task.entity.Task;
import com.workflow.backend.task.repository.TaskRepository;
import com.workflow.backend.task.utility.TaskStatus;
import com.workflow.backend.user.entity.User;
import com.workflow.backend.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {
     private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @Override
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    @Override
    public Task createTask(Task task) {
        return taskRepository.save(task);
    }

    @Override
    public List<Task> getTasksByCreator(Long userId) {
        return taskRepository.findByCreatedById(userId);
    }

    @Override
    public List<Task> getTasksByAssignee(Long userId) {
        return taskRepository.findByAssignedToId(userId);
    }

    @Override
    public List<Task> getTasksByStatus(TaskStatus status) {
        return taskRepository.findByStatus(status);
    }

    @Override
    public Task updateTaskStatus(Long taskId, TaskStatus newStatus) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));
        task.setStatus(newStatus);
        return taskRepository.save(task);
    }

    @Override
    public Task assignTask(Long taskId, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        task.setAssignedTo(user);

        return taskRepository.save(task);
    }

    @Override
    public long countTasks() {
        return taskRepository.count();
    }
}
