package com.inkwell.categorytag.repository;

import com.inkwell.categorytag.entity.Tag;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {
    Optional<Tag> findBySlug(String slug);
    boolean existsByName(String name);

    @Query("SELECT t FROM Tag t ORDER BY t.postCount DESC")
    List<Tag> findTrendingTags(Pageable pageable);

    @Query("SELECT t FROM Tag t JOIN PostTag pt ON t.id = pt.tagId WHERE pt.postId = :postId")
    List<Tag> findByPostId(Long postId);

    default List<Tag> findTopTags(int limit) {
        return findTrendingTags(PageRequest.of(0, limit));
    }
    
    default Optional<Tag> findByTagId(Long id) {
        return findById(id);
    }
}
