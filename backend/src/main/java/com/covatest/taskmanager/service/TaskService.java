package com.covatest.taskmanager.service;

import com.covatest.taskmanager.dto.TaskRequest;
import com.covatest.taskmanager.dto.TaskResponse;
import com.covatest.taskmanager.entity.Task;
import com.covatest.taskmanager.entity.TaskStatus;
import com.covatest.taskmanager.entity.User;
import com.covatest.taskmanager.exception.ResourceNotFoundException;
import com.covatest.taskmanager.repository.TaskRepository;
import com.covatest.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public User currentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    public List<TaskResponse> listTasks(String email, TaskStatus status, String search) {
        User owner = currentUser(email);
        List<Task> tasks;

        boolean hasStatus = status != null;
        boolean hasSearch = search != null && !search.isBlank();

        if (hasStatus && hasSearch) {
            tasks = taskRepository.findByOwnerAndStatusAndTitleContainingIgnoreCase(owner, status, search);
        } else if (hasStatus) {
            tasks = taskRepository.findByOwnerAndStatus(owner, status);
        } else if (hasSearch) {
            tasks = taskRepository.findByOwnerAndTitleContainingIgnoreCase(owner, search);
        } else {
            tasks = taskRepository.findByOwner(owner);
        }

        return tasks.stream().map(TaskResponse::from).toList();
    }

    public TaskResponse createTask(String email, TaskRequest request) {
        User owner = currentUser(email);

        Task task = Task.builder()
                .title(request.title())
                .description(request.description())
                .status(request.status() != null ? request.status() : TaskStatus.TODO)
                .owner(owner)
                .build();

        return TaskResponse.from(taskRepository.save(task));
    }

    public TaskResponse updateTask(String email, Long id, TaskRequest request) {
        User owner = currentUser(email);
        Task task = taskRepository.findByIdAndOwner(id, owner)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + id));

        task.setTitle(request.title());
        task.setDescription(request.description());
        if (request.status() != null) {
            task.setStatus(request.status());
        }

        return TaskResponse.from(taskRepository.save(task));
    }

    public void deleteTask(String email, Long id) {
        User owner = currentUser(email);
        Task task = taskRepository.findByIdAndOwner(id, owner)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + id));

        taskRepository.delete(task);
    }
}
