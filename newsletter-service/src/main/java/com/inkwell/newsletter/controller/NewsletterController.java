package com.inkwell.newsletter.controller;

import com.inkwell.newsletter.service.NewsletterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NewsletterController {

    private final NewsletterService newsletterService;

    @PostMapping("/api/newsletter/subscribe")
    public ResponseEntity<Map<String, String>> subscribe(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(Map.of("message", newsletterService.subscribe(body.get("email"))));
    }

    @GetMapping("/api/newsletter/confirm/{token}")
    public ResponseEntity<Map<String, String>> confirm(@PathVariable String token) {
        return ResponseEntity.ok(Map.of("message", newsletterService.confirmSubscription(token)));
    }

    @PostMapping("/api/newsletter/unsubscribe")
    public ResponseEntity<Map<String, String>> unsubscribe(@RequestBody Map<String, String> body) {
        newsletterService.unsubscribe(body.get("email"));
        return ResponseEntity.ok(Map.of("message", "Unsubscribed successfully"));
    }

    @PostMapping("/api/admin/newsletter/broadcast")
    public ResponseEntity<Map<String, String>> broadcast(
            @RequestHeader(value = "X-User-Role", defaultValue = "READER") String userRole,
            @RequestBody Map<String, String> body) {
        if (!"ADMIN".equals(userRole)) {
            throw new RuntimeException("Access denied");
        }
        newsletterService.broadcast(body.get("subject"), body.get("content"));
        return ResponseEntity.ok(Map.of("message", "Broadcast started"));
    }
}
