package com.workflow.backend.task;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;


@RestController
@RequestMapping("tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping("")
    public ResponseEntity<List<Task>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }
    

    @PostMapping
    public ResponseEntity<Task> createTask(@RequestBody Task entity) {
        Task createdTask = taskService.createTask(entity);
        return ResponseEntity.ok(createdTask);
    }

    @GetMapping("created/{userId}")
    public ResponseEntity<List<Task>> getTasksByCreator(@PathVariable Long userId) {
        List<Task> tasks = taskService.getTasksByCreator(userId);
        return ResponseEntity.ok(tasks);
    }
    
    @GetMapping("assigned/{userId}")
    public ResponseEntity<List<Task>> getTasksByAssignee(@PathVariable Long userId) {
        List<Task> tasks = taskService.getTasksByAssignee(userId);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("status/{status}")
    public ResponseEntity<List<Task>> getTasksByStatus(@PathVariable TaskStatus status) {
        List<Task> tasks = taskService.getTasksByStatus(status);
        return ResponseEntity.ok(tasks);
    }

    @PatchMapping("/{taskId}/status")
    public ResponseEntity<Task> updateTaskStatus(@PathVariable Long taskId, @RequestParam TaskStatus newStatus) {
        Task task = taskService.updateTaskStatus(taskId, newStatus);
        return ResponseEntity.ok(task);

    }

    @PatchMapping("/{taskId}/assign")
    public ResponseEntity<Task> assignTask(@PathVariable Long taskId, @RequestParam Long userId) {
        Task task = taskService.assignTask(taskId, userId);
        return ResponseEntity.ok(task);
    }
    
}
