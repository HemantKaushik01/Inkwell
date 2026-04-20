package com.inkwell.categorytag.service;

import com.inkwell.categorytag.entity.Category;
import com.inkwell.categorytag.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public Category createCategory(Category category) {
        if (categoryRepository.existsByName(category.getName())) {
            throw new RuntimeException("Category already exists");
        }
        category.setSlug(generateSlug(category.getName()));
        return categoryRepository.save(category);
    }

    @Transactional(readOnly = true)
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @Transactional(readOnly = true)
    public java.util.Optional<Category> getBySlug(String slug) {
        return categoryRepository.findBySlug(slug);
    }

    public Category updateCategory(Long id, Category categoryDetails) {
        Category category = categoryRepository.findById(id).orElseThrow();
        category.setName(categoryDetails.getName());
        category.setDescription(categoryDetails.getDescription());
        category.setParentId(categoryDetails.getParentId());
        category.setSlug(generateSlug(categoryDetails.getName()));
        return categoryRepository.save(category);
    }

    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<Category> getChildren(Long parentId) {
        return categoryRepository.findByParentId(parentId);
    }

    public void incrementPostCount(Long id) {
        categoryRepository.findById(id).ifPresent(c -> {
            c.setPostCount(c.getPostCount() + 1);
            categoryRepository.save(c);
        });
    }

    public void decrementPostCount(Long id) {
        categoryRepository.findById(id).ifPresent(c -> {
            if (c.getPostCount() > 0) {
                c.setPostCount(c.getPostCount() - 1);
                categoryRepository.save(c);
            }
        });
    }

    private String generateSlug(String name) {
        return name.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .trim();
    }
}
