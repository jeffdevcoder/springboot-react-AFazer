package com.meuapp.todolist.task;

public record TaskView(Long id, String title, String description, Recurrence recurrence, boolean done) {}