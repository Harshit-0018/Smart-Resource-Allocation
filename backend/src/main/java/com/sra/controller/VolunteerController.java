package com.sra.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * VolunteerController — volunteer profile and user endpoints.
 *
 * Endpoints:
 *   GET    /api/users/me              — own profile
 *   PUT    /api/users/me              — update own profile (triggers re-embed)
 *   GET    /api/users/{uid}           — get any user [Admin]
 *   DELETE /api/users/{uid}           — delete user [Admin]
 *   PUT    /api/users/{uid}/verify    — approve volunteer [Admin]
 *   POST   /api/users/embed/{uid}     — trigger embedding update [Admin/Internal]
 */
@RestController
@RequestMapping("/api/users")
public class VolunteerController {

    @GetMapping("/me")
    public ResponseEntity<?> getOwnProfile() {
        // TODO: Implement get own profile
        return ResponseEntity.ok().build();
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateOwnProfile(@RequestBody Object body) {
        // TODO: Implement profile update + trigger re-embedding
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{uid}")
    public ResponseEntity<?> getUser(@PathVariable String uid) {
        // TODO: Implement get user by UID (admin only)
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{uid}")
    public ResponseEntity<?> deleteUser(@PathVariable String uid) {
        // TODO: Implement delete user (admin only)
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{uid}/verify")
    public ResponseEntity<?> verifyUser(@PathVariable String uid) {
        // TODO: Implement volunteer verification (admin only)
        return ResponseEntity.ok().build();
    }

    @PostMapping("/embed/{uid}")
    public ResponseEntity<?> triggerEmbedding(@PathVariable String uid) {
        // TODO: Trigger Vertex AI skill embedding for user
        return ResponseEntity.ok().build();
    }
}
