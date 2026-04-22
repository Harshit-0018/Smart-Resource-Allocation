package com.sra.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * TaskController — CRUD endpoints for community tasks.
 *
 * Endpoints:
 *   GET    /api/tasks                    — list tasks (query: status, category, urgencyMin)
 *   POST   /api/tasks                    — create task [NGO]
 *   GET    /api/tasks/{taskId}           — get single task
 *   PUT    /api/tasks/{taskId}           — update task [NGO]
 *   DELETE /api/tasks/{taskId}           — delete task [Admin]
 *   POST   /api/tasks/{taskId}/apply     — volunteer self-applies [Volunteer]
 *   GET    /api/tasks/{taskId}/applicants — list self-applicants [NGO/Admin]
 */
@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @GetMapping
    public ResponseEntity<?> listTasks(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Integer urgencyMin) {
        // TODO: Implement task listing with filters
        return ResponseEntity.ok().build();
    }

    @PostMapping
    public ResponseEntity<?> createTask(@RequestBody Object body) {
        // TODO: Implement task creation
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<?> getTask(@PathVariable String taskId) {
        // TODO: Implement get single task
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{taskId}")
    public ResponseEntity<?> updateTask(@PathVariable String taskId, @RequestBody Object body) {
        // TODO: Implement task update
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<?> deleteTask(@PathVariable String taskId) {
        // TODO: Implement task deletion (admin only)
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{taskId}/apply")
    public ResponseEntity<?> applyToTask(@PathVariable String taskId) {
        // TODO: Implement volunteer self-application
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{taskId}/applicants")
    public ResponseEntity<?> getApplicants(@PathVariable String taskId) {
        // TODO: Implement list applicants
        return ResponseEntity.ok().build();
    }
}
