package com.covatest.taskmanager.controller;

import com.covatest.taskmanager.dto.TaskRequest;
import com.covatest.taskmanager.dto.TaskResponse;
import com.covatest.taskmanager.entity.TaskStatus;
import com.covatest.taskmanager.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public ResponseEntity<List<TaskResponse>> listTasks(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(taskService.listTasks(userDetails.getUsername(), status, search));
    }

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody TaskRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(taskService.createTask(userDetails.getUsername(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest request) {
        return ResponseEntity.ok(taskService.updateTask(userDetails.getUsername(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        taskService.deleteTask(userDetails.getUsername(), id);
        return ResponseEntity.noContent().build();
    }
}
