package com.inkwell.post.repository;

import com.inkwell.post.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    Optional<Post> findBySlug(String slug);
    Page<Post> findByStatus(Post.PostStatus status, Pageable pageable);
    List<Post> findByAuthorIdAndStatus(Long authorId, Post.PostStatus status);
    List<Post> findByAuthorId(Long authorId);

    @Query("SELECT p FROM Post p WHERE p.status = 'PUBLISHED' AND " +
           "(LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.content) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Post> searchPublished(@Param("query") String query, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.status = 'PUBLISHED' ORDER BY p.viewCount DESC")
    List<Post> findTrendingPosts(Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.featured = true AND p.status = 'PUBLISHED'")
    List<Post> findFeaturedPosts();

    Page<Post> findByCategoryIdAndStatus(Long categoryId, Post.PostStatus status, Pageable pageable);
    
    @Query("SELECT p FROM Post p JOIN p.tags t WHERE t = :tag AND p.status = 'PUBLISHED'")
    Page<Post> findByTag(@Param("tag") String tag, Pageable pageable);

    long countByAuthorId(Long authorId);
    long countByStatus(Post.PostStatus status);

    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE Post p SET p.viewCount = p.viewCount + 1 WHERE p.id = :postId")
    void incrementViewCount(@Param("postId") Long postId);

    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE Post p SET p.likeCount = p.likeCount + 1 WHERE p.id = :postId")
    void incrementLikeCount(@Param("postId") Long postId);
}
