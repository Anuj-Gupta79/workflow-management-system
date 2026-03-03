package com.workflow.backend.dashboard.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RecentTask {

    private Long id;
    private String title;
    private String status;
    private String priority;
    private LocalDateTime createdAt;

}