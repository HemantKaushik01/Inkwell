package com.inkwell.comment.service;

import com.inkwell.comment.dto.AddCommentRequest;
import com.inkwell.comment.dto.CommentDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CommentService {
    CommentDto addComment(Long postId, Long userId, String userName, AddCommentRequest request);
    CommentDto replyToComment(Long commentId, Long userId, String userName, AddCommentRequest request);
    Page<CommentDto> getCommentsByPost(Long postId, Pageable pageable);
    CommentDto getCommentById(Long id);
    java.util.List<CommentDto> getReplies(Long parentCommentId);
    CommentDto updateComment(Long id, Long userId, AddCommentRequest request);
    void deleteComment(Long commentId, Long userId, String userRole);
    CommentDto approveComment(Long id, String userRole);
    CommentDto rejectComment(Long id, String userRole);
    CommentDto likeComment(Long id);
    CommentDto unlikeComment(Long id);
    long getCommentCount(Long postId);
    CommentDto updateCommentStatus(Long commentId, String userRole, String status); // Keep legacy for compatibility or replace
}
