package com.workflow.backend.task;

import java.util.List;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;

    void createTask(Task task) {
        taskRepository.save(task);
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
    
}
