package com.workflow.backend.task;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByCreatedById(Long userId);

    List<Task> findByAssignedToId(Long userId);

    List<Task> findByStatus(TaskStatus status);
}
