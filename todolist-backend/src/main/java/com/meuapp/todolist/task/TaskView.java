package com.meuapp.todolist.task;

import java.time.LocalDate;

public record TaskView(Long id, String title, String description, Recurrence recurrence,
                       LocalDate startDate, LocalDate endDate, boolean urgent, boolean done) {}