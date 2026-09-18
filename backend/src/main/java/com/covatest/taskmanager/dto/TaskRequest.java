package com.covatest.taskmanager.dto;

import com.covatest.taskmanager.entity.TaskStatus;
import jakarta.validation.constraints.NotBlank;

public record TaskRequest(
        @NotBlank String title,
        String description,
        TaskStatus status
) {
}
