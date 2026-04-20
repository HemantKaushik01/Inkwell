package com.inkwell.notification.controller;

import com.inkwell.notification.entity.Notification;
import com.inkwell.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/api/notifications")
    public ResponseEntity<List<Notification>> getUserNotifications(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(notificationService.getByRecipient(userId));
    }

    @PostMapping("/api/notifications/mark-all-read")
    public ResponseEntity<Map<String, String>> markAllRead(@RequestHeader("X-User-Id") Long userId) {
        notificationService.markAllRead(userId);
        return ResponseEntity.ok(Map.of("message", "All marked as read"));
    }

    @DeleteMapping("/api/notifications/delete-read")
    public ResponseEntity<Map<String, String>> deleteRead(@RequestHeader("X-User-Id") Long userId) {
        notificationService.deleteRead(userId);
        return ResponseEntity.ok(Map.of("message", "Read notifications deleted"));
    }

    @GetMapping("/api/notifications/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(userId)));
    }

    @PostMapping("/api/notifications/bulk")
    public ResponseEntity<Void> sendBulk(
            @RequestHeader(value = "X-User-Role", defaultValue = "READER") String role,
            @RequestBody Map<String, Object> body) {
        if (!"ADMIN".equals(role)) {
            throw new RuntimeException("Access denied");
        }
        List<Long> recipientIds = (List<Long>) body.get("recipientIds");
        String type = (String) body.get("type");
        String title = (String) body.get("title");
        String message = (String) body.get("message");
        Long relatedId = body.get("relatedId") != null ? ((Number) body.get("relatedId")).longValue() : null;
        String relatedSlug = (String) body.get("relatedSlug");
        String relatedType = (String) body.get("relatedType");
        
        notificationService.sendBulk(recipientIds, type, title, message, relatedId, relatedSlug, relatedType);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/api/notifications/all")
    public ResponseEntity<List<Notification>> getAll(@RequestHeader(value = "X-User-Role", defaultValue = "READER") String role) {
        if (!"ADMIN".equals(role)) {
            throw new RuntimeException("Access denied");
        }
        return ResponseEntity.ok(notificationService.getAll());
    }

    @PatchMapping("/api/notifications/{id}/read")
    public ResponseEntity<Map<String, String>> markAsRead(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        notificationService.markAsRead(id, userId);
        return ResponseEntity.ok(Map.of("message", "Marked as read"));
    }

    @DeleteMapping("/api/notifications/{id}")
    public ResponseEntity<Map<String, String>> deleteNotification(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        notificationService.deleteNotification(id, userId);
        return ResponseEntity.ok(Map.of("message", "Deleted successfully"));
    }

    // Internal endpoint for other services to trigger notifications
    @PostMapping("/api/notifications/internal")
    public ResponseEntity<Void> createNotificationInternal(@RequestBody Map<String, Object> payload) {
        notificationService.processNotification(payload);
        return ResponseEntity.ok().build();
    }
}
