package com.meuapp.todolist.task;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;

public interface TaskCompletionRepository extends JpaRepository<TaskCompletion, Long> {
    boolean existsByTaskAndDateGreaterThanEqual(Task task, LocalDate date);
    boolean existsByTaskAndDate(Task task, LocalDate date);
    void deleteByTaskAndDate(Task task, LocalDate date);
}