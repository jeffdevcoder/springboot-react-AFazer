package com.meuapp.todolist.task;

import com.meuapp.todolist.user.User;
import com.meuapp.todolist.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
public class TaskService {

    private final TaskRepository tasks;
    private final TaskCompletionRepository completions;
    private final UserRepository users;

    public TaskService(TaskRepository tasks, TaskCompletionRepository completions, UserRepository users) {
        this.tasks = tasks;
        this.completions = completions;
        this.users = users;
    }

    @Transactional(readOnly = true)
    public List<TaskView> today(String email) {
        LocalDate today = LocalDate.now();
        return tasks.findByUserAndActiveTrueOrderByIdAsc(user(email)).stream()
                .filter(t -> t.occursOn(today))
                .filter(t -> t.getRecurrence() != Recurrence.ONCE
                        || !completions.existsByTaskAndDateGreaterThanEqual(t, t.getStartDate()))
                .map(t -> toView(t, completions.existsByTaskAndDate(t, today)))
                .toList();
    }

    @Transactional
    public TaskView create(String email, CreateTaskRequest req) {
        LocalDate start = req.startDate() != null ? req.startDate() : LocalDate.now();
        checkDates(start, req.endDate());

        Task task = new Task();
        task.setUser(user(email));
        task.setTitle(req.title().trim());
        task.setDescription(req.description() == null || req.description().isBlank()
                ? null : req.description().trim());
        task.setRecurrence(req.recurrence());
        task.setStartDate(start);
        task.setEndDate(req.endDate());
        tasks.save(task);
        return toView(task, false);
    }

    @Transactional
    public TaskView update(String email, Long id, CreateTaskRequest req) {
        Task task = find(email, id);
        LocalDate start = req.startDate() != null ? req.startDate() : task.getStartDate();

        if (task.getRecurrence() != req.recurrence()) {
            task.setRecurrence(req.recurrence());
            if (start.equals(task.getStartDate())) start = LocalDate.now();
        }
        checkDates(start, req.endDate());

        task.setTitle(req.title().trim());
        task.setDescription(req.description() == null || req.description().isBlank()
                ? null : req.description().trim());
        task.setStartDate(start);
        task.setEndDate(req.endDate());
        return toView(task, completions.existsByTaskAndDate(task, LocalDate.now()));
    }

    @Transactional
    public void delete(String email, Long id) {
        find(email, id).setActive(false);
    }

    @Transactional
    public void complete(String email, Long id) {
        LocalDate today = LocalDate.now();
        Task task = find(email, id);
        if (!task.occursOn(today)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tarefa não é de hoje");
        }
        if (!completions.existsByTaskAndDate(task, today)) {
            completions.save(new TaskCompletion(task, today));
        }
    }

    @Transactional
    public void uncomplete(String email, Long id) {
        completions.deleteByTaskAndDate(find(email, id), LocalDate.now());
    }

    private Task find(String email, Long id) {
        return tasks.findByIdAndUserAndActiveTrue(id, user(email))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    private User user(String email) {
        return users.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    private TaskView toView(Task t, boolean done) {
        return new TaskView(t.getId(), t.getTitle(), t.getDescription(), t.getRecurrence(),
                t.getStartDate(), t.getEndDate(), done);
    }

    private void checkDates(LocalDate start, LocalDate end) {
        if (end != null && end.isBefore(start)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "A data final não pode ser antes da inicial");
        }
    }
}