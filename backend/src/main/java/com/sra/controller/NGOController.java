package com.sra.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * NGOController — NGO registration and management endpoints.
 *
 * Endpoints:
 *   GET    /api/ngos                — list all NGOs
 *   POST   /api/ngos                — register NGO [NGO]
 *   GET    /api/ngos/{ngoId}        — get NGO detail
 *   PUT    /api/ngos/{ngoId}/verify — approve NGO [Admin]
 *   DELETE /api/ngos/{ngoId}        — delete NGO [Admin]
 *   GET    /api/ngos/{ngoId}/tasks  — tasks posted by this NGO [NGO/Admin]
 */
@RestController
@RequestMapping("/api/ngos")
public class NGOController {

    @GetMapping
    public ResponseEntity<?> listNGOs() {
        // TODO: Implement list all NGOs
        return ResponseEntity.ok().build();
    }

    @PostMapping
    public ResponseEntity<?> registerNGO(@RequestBody Object body) {
        // TODO: Implement NGO registration
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{ngoId}")
    public ResponseEntity<?> getNGO(@PathVariable String ngoId) {
        // TODO: Implement get NGO detail
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{ngoId}/verify")
    public ResponseEntity<?> verifyNGO(@PathVariable String ngoId) {
        // TODO: Implement NGO verification (admin only)
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{ngoId}")
    public ResponseEntity<?> deleteNGO(@PathVariable String ngoId) {
        // TODO: Implement NGO deletion (admin only)
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{ngoId}/tasks")
    public ResponseEntity<?> getNGOTasks(@PathVariable String ngoId) {
        // TODO: Implement get tasks by NGO
        return ResponseEntity.ok().build();
    }
}
