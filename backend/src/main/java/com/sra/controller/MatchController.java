package com.sra.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * MatchController — AI matching algorithm trigger and results.
 *
 * Endpoints:
 *   POST /api/match/run/{taskId}       — trigger matching algorithm [Admin]
 *   GET  /api/match/results/{taskId}   — ranked candidate list [Admin]
 *   PUT  /api/match/{matchId}/confirm  — admin confirms match [Admin]
 *   PUT  /api/match/{matchId}/respond  — volunteer accepts or declines [Volunteer]
 *   GET  /api/match/my-matches         — volunteer's own match history [Volunteer]
 *   GET  /api/match/task/{taskId}      — all matches for a task [NGO/Admin]
 */
@RestController
@RequestMapping("/api/match")
public class MatchController {

    @PostMapping("/run/{taskId}")
    public ResponseEntity<?> runMatching(@PathVariable String taskId) {
        // TODO: Trigger matching algorithm
        return ResponseEntity.ok().build();
    }

    @GetMapping("/results/{taskId}")
    public ResponseEntity<?> getResults(@PathVariable String taskId) {
        // TODO: Return ranked candidate list
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{matchId}/confirm")
    public ResponseEntity<?> confirmMatch(@PathVariable String matchId) {
        // TODO: Admin confirms a match
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{matchId}/respond")
    public ResponseEntity<?> respondToMatch(
            @PathVariable String matchId,
            @RequestBody Object body) {
        // TODO: Volunteer accepts or declines match
        return ResponseEntity.ok().build();
    }

    @GetMapping("/my-matches")
    public ResponseEntity<?> getMyMatches() {
        // TODO: Return current volunteer's matches
        return ResponseEntity.ok().build();
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<?> getMatchesForTask(@PathVariable String taskId) {
        // TODO: Return all matches for a task
        return ResponseEntity.ok().build();
    }
}
