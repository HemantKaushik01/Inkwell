package com.inkwell.categorytag.controller;

import com.inkwell.categorytag.entity.Tag;
import com.inkwell.categorytag.service.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/tags")
@CrossOrigin(origins = "*")
public class TagController {
    private final TagService tagService;

    @GetMapping
    public ResponseEntity<List<Tag>> getAllTags() {
        return ResponseEntity.ok(tagService.getAllTags());
    }

    @GetMapping("/trending")
    public ResponseEntity<List<Tag>> getTrendingTags() {
        return ResponseEntity.ok(tagService.getTrendingTags());
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<List<Tag>> getTagsByPost(@PathVariable Long postId) {
        return ResponseEntity.ok(tagService.getTagsByPost(postId));
    }

    @PostMapping("/post/{postId}/{tagId}")
    public ResponseEntity<Void> addTagToPost(@PathVariable Long postId, @PathVariable Long tagId) {
        tagService.addTagToPost(postId, tagId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/post/{postId}/{tagId}")
    public ResponseEntity<Void> removeTagFromPost(@PathVariable Long postId, @PathVariable Long tagId) {
        tagService.removeTagFromPost(postId, tagId);
        return ResponseEntity.ok().build();
    }

    @PostMapping
    public ResponseEntity<Tag> createTag(@RequestBody Tag tag) {
        return ResponseEntity.ok(tagService.createTag(tag));
    }
}
