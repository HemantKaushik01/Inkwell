package com.inkwell.categorytag.controller;

import com.inkwell.categorytag.entity.Category;
import com.inkwell.categorytag.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*")
public class CategoryController {
    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<Category> getBySlug(@PathVariable String slug) {
        return categoryService.getBySlug(slug)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/children")
    public ResponseEntity<List<Category>> getChildren(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.getChildren(id));
    }

    @PostMapping
    public ResponseEntity<Category> createCategory(
            @RequestHeader(value = "X-User-Role", defaultValue = "READER") String userRole,
            @RequestBody Category category) {
        if (!"ADMIN".equals(userRole)) {
            throw new RuntimeException("Access denied");
        }
        return ResponseEntity.ok(categoryService.createCategory(category));
    }
}
