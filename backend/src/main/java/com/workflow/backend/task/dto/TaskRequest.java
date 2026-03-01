package com.workflow.backend.task.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TaskRequest {

    @NotBlank
    private String title;

    private String description;

    private String priority;

    private Long assignedTo;
}
