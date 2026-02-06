package com.workflow.backend.task;

import java.util.List;

import org.springframework.stereotype.Service;

import com.workflow.backend.user.User;
import com.workflow.backend.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    Task createTask(Task task) {
        return taskRepository.save(task);
    }

    List<Task> getTasksByCreator(Long userId) {
        return taskRepository.findByCreatedById(userId);
    }

    List<Task> getTasksByAssignee(Long userId) {
        return taskRepository.findByAssignedToId(userId);
    }

    List<Task> getTasksByStatus(TaskStatus status) {
        return taskRepository.findByStatus(status);
    }

    Task updateTaskStatus(Long taskId, TaskStatus newStatus) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));
        task.setStatus(newStatus);
        return taskRepository.save(task);
    }

    Task assignTask(Long taskId, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        task.setAssignedTo(user);
    
        return taskRepository.save(task);
    }
    
}
