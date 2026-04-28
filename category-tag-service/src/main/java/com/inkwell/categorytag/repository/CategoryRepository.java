package com.inkwell.categorytag.repository;

import com.inkwell.categorytag.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findBySlug(String slug);
    boolean existsByName(String name);
    
    java.util.List<Category> findByParentId(Long parentId);
    
    // Specifications often refer to findByCategoryId
    default Optional<Category> findByCategoryId(Long id) {
        return findById(id);
    }
}
