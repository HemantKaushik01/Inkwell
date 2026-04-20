package com.inkwell.post.controller;

import com.inkwell.post.dto.CreatePostRequest;
import com.inkwell.post.dto.PostDto;
import com.inkwell.post.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PostController {

    private final PostService postService;

    @PostMapping("/api/posts")
    public ResponseEntity<PostDto> createPost(
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Email") String userEmail,
            @RequestHeader(value = "X-User-Name", required = false) String userName,
            @Valid @RequestBody CreatePostRequest request) {
        String authorName = userName != null ? userName : userEmail;
        return ResponseEntity.ok(postService.createPost(userId, authorName, request));
    }

    @GetMapping("/api/posts")
    public ResponseEntity<Page<PostDto>> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(postService.getAllPublishedPosts(
                PageRequest.of(page, size, Sort.by("publishedAt").descending())));
    }

    @GetMapping("/api/posts/search")
    public ResponseEntity<Page<PostDto>> searchPosts(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(postService.searchPosts(query, PageRequest.of(page, size)));
    }

    @GetMapping("/api/posts/featured")
    public ResponseEntity<List<PostDto>> getFeaturedPosts() {
        return ResponseEntity.ok(postService.getFeaturedPosts());
    }

    @GetMapping("/api/posts/trending")
    public ResponseEntity<List<PostDto>> getTrendingPosts() {
        return ResponseEntity.ok(postService.getTrendingPosts());
    }

    @GetMapping("/api/posts/{id}")
    public ResponseEntity<PostDto> getPostById(@PathVariable Long id) {
        return ResponseEntity.ok(postService.getPostById(id));
    }

    @GetMapping("/api/posts/slug/{slug}")
    public ResponseEntity<PostDto> getPostBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(postService.getPostBySlug(slug));
    }

    @GetMapping("/api/posts/author/{authorId}")
    public ResponseEntity<List<PostDto>> getPostsByAuthor(@PathVariable Long authorId) {
        return ResponseEntity.ok(postService.getPostsByAuthor(authorId));
    }

    @GetMapping("/api/posts/category/{categoryId}")
    public ResponseEntity<Page<PostDto>> getPostsByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(postService.getPostsByCategory(categoryId, PageRequest.of(page, size)));
    }

    @GetMapping("/api/posts/tag/{tag}")
    public ResponseEntity<Page<PostDto>> getPostsByTag(
            @PathVariable String tag,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(postService.getPostsByTag(tag, PageRequest.of(page, size)));
    }

    @PutMapping("/api/posts/{id}")
    public ResponseEntity<PostDto> updatePost(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader(value = "X-User-Role", defaultValue = "READER") String userRole,
            @RequestBody CreatePostRequest request) {
        return ResponseEntity.ok(postService.updatePost(id, userId, userRole, request));
    }

    @DeleteMapping("/api/posts/{id}")
    public ResponseEntity<Map<String, String>> deletePost(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader(value = "X-User-Role", defaultValue = "READER") String userRole) {
        postService.deletePost(id, userId, userRole);
        return ResponseEntity.ok(Map.of("message", "Post deleted successfully"));
    }

    @PatchMapping("/api/posts/{id}/status")
    public ResponseEntity<PostDto> updateStatus(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader(value = "X-User-Role", defaultValue = "READER") String userRole,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(postService.updateStatus(id, userId, userRole, body.get("status")));
    }

    @PostMapping("/api/posts/{id}/views")
    public ResponseEntity<Void> incrementViews(@PathVariable Long id) {
        postService.incrementViewCount(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/api/posts/{id}/likes")
    public ResponseEntity<Void> incrementLikes(@PathVariable Long id) {
        postService.incrementLikeCount(id);
        return ResponseEntity.ok().build();
    }

    // Admin endpoints
    @PatchMapping("/api/admin/posts/{id}/feature")
    public ResponseEntity<PostDto> featurePost(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        return ResponseEntity.ok(postService.featurePost(id, body.getOrDefault("featured", false)));
    }
}
