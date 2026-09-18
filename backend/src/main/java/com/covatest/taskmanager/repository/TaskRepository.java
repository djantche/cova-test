package com.covatest.taskmanager.repository;

import com.covatest.taskmanager.entity.Task;
import com.covatest.taskmanager.entity.TaskStatus;
import com.covatest.taskmanager.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByOwnerAndStatusAndTitleContainingIgnoreCase(User owner, TaskStatus status, String search);

    List<Task> findByOwnerAndStatus(User owner, TaskStatus status);

    List<Task> findByOwnerAndTitleContainingIgnoreCase(User owner, String search);

    List<Task> findByOwner(User owner);

    Optional<Task> findByIdAndOwner(Long id, User owner);
}
