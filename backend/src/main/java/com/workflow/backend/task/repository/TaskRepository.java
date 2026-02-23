package com.workflow.backend.task.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.workflow.backend.task.entity.Task;
import com.workflow.backend.task.utility.TaskStatus;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByCreatedById(Long userId);

    List<Task> findByAssignedToId(Long userId);

    List<Task> findByStatus(TaskStatus status);
}
