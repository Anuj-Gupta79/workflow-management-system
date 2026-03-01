package com.workflow.backend.task.dto;

import java.time.LocalDateTime;

import com.workflow.backend.task.entity.Task;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TaskResponse {

    private Long id;
    private String title;
    private String description;
    private String status;
    private String priority;
    private LocalDateTime dueDate;

    private Long createdById;
    private Long assignedToId;

    public TaskResponse(Task task) {
        this.id = task.getId();
        this.title = task.getTitle();
        this.description = task.getDescription();
        this.status = task.getStatus().name();
        this.priority = task.getPriority().name();
        this.dueDate = task.getDueDate();
        this.createdById = task.getCreatedBy().getId();
        this.assignedToId = task.getAssignedTo() != null ? task.getAssignedTo().getId() : null;
    }
}
