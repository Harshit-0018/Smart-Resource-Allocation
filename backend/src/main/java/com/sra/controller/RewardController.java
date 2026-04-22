package com.sra.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * RewardController — volunteer rewards, redemption, and leaderboard.
 *
 * Endpoints:
 *   GET  /api/rewards/my-points    — volunteer's current points balance [Volunteer]
 *   GET  /api/rewards/catalog      — available redemption items
 *   POST /api/rewards/redeem       — redeem points [Volunteer]
 *   GET  /api/rewards/leaderboard  — top 20 volunteers by totalPoints
 *   GET  /api/rewards/history      — volunteer's reward history [Volunteer]
 */
@RestController
@RequestMapping("/api/rewards")
public class RewardController {

    @GetMapping("/my-points")
    public ResponseEntity<?> getMyPoints() {
        // TODO: Return current volunteer's points balance
        return ResponseEntity.ok().build();
    }

    @GetMapping("/catalog")
    public ResponseEntity<?> getCatalog() {
        // TODO: Return available redemption items
        return ResponseEntity.ok().build();
    }

    @PostMapping("/redeem")
    public ResponseEntity<?> redeemReward(@RequestBody Object body) {
        // TODO: Implement point redemption with Firestore transaction
        return ResponseEntity.ok().build();
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<?> getLeaderboard() {
        // TODO: Return top 20 volunteers by totalPoints
        return ResponseEntity.ok().build();
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory() {
        // TODO: Return current volunteer's reward history
        return ResponseEntity.ok().build();
    }
}
