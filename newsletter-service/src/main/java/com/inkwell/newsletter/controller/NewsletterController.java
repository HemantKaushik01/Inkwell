package com.inkwell.newsletter.controller;

import com.inkwell.newsletter.service.NewsletterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.HashSet;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NewsletterController {

    private final NewsletterService newsletterService;

    @PostMapping("/api/newsletter/subscribe")
    public ResponseEntity<Map<String, String>> subscribe(@RequestBody Map<String, Object> body) {
        String email = (String) body.get("email");
        List<String> tagsList = (List<String>) body.get("tags");
        Set<String> tags = tagsList != null ? new HashSet<>(tagsList) : new HashSet<>();
        return ResponseEntity.ok(Map.of("message", newsletterService.subscribe(email, tags)));
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
            @RequestBody Map<String, Object> body) {
        if (!"ADMIN".equals(userRole)) {
            throw new RuntimeException("Access denied");
        }
        String subject = (String) body.get("subject");
        String content = (String) body.get("content");
        List<String> tags = (List<String>) body.get("tags");
        
        newsletterService.broadcast(subject, content, tags);
        return ResponseEntity.ok(Map.of("message", "Broadcast started"));
    }
    
    @PostMapping("/api/internal/newsletter/dispatch-new-post")
    public ResponseEntity<Void> dispatchNewPost(@RequestBody Map<String, Object> payload) {
        String authorName = (String) payload.get("authorName");
        String postTitle = (String) payload.get("postTitle");
        Long postId = payload.get("postId") != null ? ((Number) payload.get("postId")).longValue() : null;
        String postSlug = (String) payload.get("postSlug");
        
        newsletterService.notifyNewPost(authorName, postTitle, postId, postSlug);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/api/newsletter/campaigns")
    public ResponseEntity<List<com.inkwell.newsletter.entity.Campaign>> getCampaigns() {
        return ResponseEntity.ok(newsletterService.getAllCampaigns());
    }

    @PutMapping("/api/admin/newsletter/campaigns/{id}")
    public ResponseEntity<Map<String, String>> updateCampaign(
            @RequestHeader(value = "X-User-Role", defaultValue = "READER") String userRole,
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        if (!"ADMIN".equals(userRole)) {
            throw new RuntimeException("Access denied");
        }
        String subject = (String) body.get("subject");
        String content = (String) body.get("content");
        newsletterService.updateCampaign(id, subject, content);
        return ResponseEntity.ok(Map.of("message", "Newsletter updated successfully"));
    }

    @DeleteMapping("/api/admin/newsletter/campaigns/{id}")
    public ResponseEntity<Map<String, String>> deleteCampaign(
            @RequestHeader(value = "X-User-Role", defaultValue = "READER") String userRole,
            @PathVariable Long id) {
        if (!"ADMIN".equals(userRole)) {
            throw new RuntimeException("Access denied");
        }
        newsletterService.deleteCampaign(id);
        return ResponseEntity.ok(Map.of("message", "Newsletter deleted successfully"));
    }
}
