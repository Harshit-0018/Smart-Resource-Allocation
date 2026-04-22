package com.sra.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * AdminController — platform administration endpoints.
 *
 * Endpoints:
 *   GET /api/admin/stats       — dashboard totals (NGOs, volunteers, tasks, matches)
 *   GET /api/admin/audit-logs  — paginated audit log (query: action, dateFrom, dateTo)
 *   GET /api/admin/unverified  — pending NGO and volunteer approvals
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        // TODO: Return platform-wide statistics
        return ResponseEntity.ok().build();
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<?> getAuditLogs(
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo) {
        // TODO: Return paginated audit logs
        return ResponseEntity.ok().build();
    }

    @GetMapping("/unverified")
    public ResponseEntity<?> getUnverified() {
        // TODO: Return pending NGO and volunteer approvals
        return ResponseEntity.ok().build();
    }
}
