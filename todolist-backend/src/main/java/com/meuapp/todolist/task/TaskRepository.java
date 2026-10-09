package com.meuapp.todolist.task;

import com.meuapp.todolist.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUserAndActiveTrueOrderByIdAsc(User user);
    Optional<Task> findByIdAndUserAndActiveTrue(Long id, User user);
}