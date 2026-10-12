package com.meuapp.todolist.task;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record CreateTaskRequest(
        @NotBlank(message = "Informe o nome da tarefa") @Size(max = 100) String title,
        @Size(max = 500) String description,
        @NotNull Recurrence recurrence,
        LocalDate startDate,
        LocalDate endDate) {}