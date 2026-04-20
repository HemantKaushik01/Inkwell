package com.inkwell.comment.controller;

import com.inkwell.comment.dto.AddCommentRequest;
import com.inkwell.comment.dto.CommentDto;
import com.inkwell.comment.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CommentController {

    private final CommentService commentService;

    @PostMapping("/api/comments")
    public ResponseEntity<CommentDto> addComment(
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader(value = "X-User-Name", required = false) String userName,
            @RequestHeader("X-User-Email") String userEmail,
            @RequestParam Long postId,
            @Valid @RequestBody AddCommentRequest request) {
        String name = userName != null ? userName : userEmail;
        return ResponseEntity.ok(commentService.addComment(postId, userId, name, request));
    }

    @PostMapping("/api/comments/{id}/reply")
    public ResponseEntity<CommentDto> replyToComment(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader(value = "X-User-Name", required = false) String userName,
            @RequestHeader("X-User-Email") String userEmail,
            @Valid @RequestBody AddCommentRequest request) {
        String name = userName != null ? userName : userEmail;
        return ResponseEntity.ok(commentService.replyToComment(id, userId, name, request));
    }

    @GetMapping("/api/comments/{id}")
    public ResponseEntity<CommentDto> getCommentById(@PathVariable Long id) {
        return ResponseEntity.ok(commentService.getCommentById(id));
    }

    @GetMapping("/api/comments/{id}/replies")
    public ResponseEntity<java.util.List<CommentDto>> getReplies(@PathVariable Long id) {
        return ResponseEntity.ok(commentService.getReplies(id));
    }

    @GetMapping("/api/comments/post/{postId}")
    public ResponseEntity<Page<CommentDto>> getCommentsByPost(
            @PathVariable Long postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        return ResponseEntity.ok(commentService.getCommentsByPost(postId, 
                PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/api/comments/post/{postId}/count")
    public ResponseEntity<Long> getCommentCount(@PathVariable Long postId) {
        return ResponseEntity.ok(commentService.getCommentCount(postId));
    }

    @PutMapping("/api/comments/{id}")
    public ResponseEntity<CommentDto> updateComment(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody AddCommentRequest request) {
        return ResponseEntity.ok(commentService.updateComment(id, userId, request));
    }

    @DeleteMapping("/api/comments/{id}")
    public ResponseEntity<Map<String, String>> deleteComment(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader(value = "X-User-Role", defaultValue = "READER") String userRole) {
        commentService.deleteComment(id, userId, userRole);
        return ResponseEntity.ok(Map.of("message", "Comment deleted"));
    }

    @PutMapping("/api/comments/{id}/approve")
    public ResponseEntity<CommentDto> approveComment(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", defaultValue = "READER") String userRole) {
        return ResponseEntity.ok(commentService.approveComment(id, userRole));
    }

    @PutMapping("/api/comments/{id}/reject")
    public ResponseEntity<CommentDto> rejectComment(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", defaultValue = "READER") String userRole) {
        return ResponseEntity.ok(commentService.rejectComment(id, userRole));
    }

    @PutMapping("/api/comments/{id}/like")
    public ResponseEntity<CommentDto> likeComment(@PathVariable Long id) {
        return ResponseEntity.ok(commentService.likeComment(id));
    }

    @PutMapping("/api/comments/{id}/unlike")
    public ResponseEntity<CommentDto> unlikeComment(@PathVariable Long id) {
        return ResponseEntity.ok(commentService.unlikeComment(id));
    }

    @PatchMapping("/api/admin/comments/{id}/moderate")
    public ResponseEntity<CommentDto> moderateComment(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", defaultValue = "READER") String userRole,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(commentService.updateCommentStatus(id, userRole, body.get("status")));
    }
}
