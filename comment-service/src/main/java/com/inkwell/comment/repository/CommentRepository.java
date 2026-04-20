package com.inkwell.comment.repository;

import com.inkwell.comment.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    Page<Comment> findByPostIdAndStatusNot(Long postId, Comment.CommentStatus status, Pageable pageable);
    
    List<Comment> findByParentCommentIdAndStatusNot(Long parentCommentId, Comment.CommentStatus status);
    
    List<Comment> findByAuthorId(Long authorId);
    
    List<Comment> findByPostId(Long postId);
    
    List<Comment> findByParentCommentId(Long parentCommentId);
    
    @Query("SELECT c FROM Comment c WHERE c.postId = :postId AND c.parentCommentId IS NULL")
    Page<Comment> findTopLevelByPostId(Long postId, Pageable pageable);
    
    long countByPostId(Long postId);
    
    List<Comment> findByStatus(Comment.CommentStatus status);
    
    @Modifying
    @Query("UPDATE Comment c SET c.status = 'DELETED' WHERE c.id = :commentId")
    void deleteByCommentId(Long commentId);
}
