package com.inkwell.analytics.controller;

import com.inkwell.analytics.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats(
            @RequestHeader(value = "X-User-Role", defaultValue = "READER") String userRole) {
        if (!"ADMIN".equals(userRole)) {
            throw new RuntimeException("Access denied");
        }
        return ResponseEntity.ok(analyticsService.getDashboardStats());
    }

    @GetMapping("/author/{authorId}")
    public ResponseEntity<Map<String, Object>> getAuthorStats(
            @PathVariable Long authorId,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader(value = "X-User-Role", defaultValue = "READER") String userRole) {
        if (!"ADMIN".equals(userRole) && !authorId.equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        return ResponseEntity.ok(analyticsService.getAuthorStats(authorId));
    }

    @GetMapping("/trending")
    public ResponseEntity<List<Map<String, Object>>> getTrending() {
        return ResponseEntity.ok(analyticsService.getTrending());
    }
}
