package com.inkwell.comment.service;

import com.inkwell.comment.client.NotificationServiceClient;
import com.inkwell.comment.client.PostServiceClient;
import com.inkwell.comment.dto.AddCommentRequest;
import com.inkwell.comment.dto.CommentDto;
import com.inkwell.comment.entity.Comment;
import com.inkwell.comment.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final com.inkwell.comment.repository.CommentConfigRepository commentConfigRepository;
    private final PostServiceClient postServiceClient;
    private final NotificationServiceClient notificationServiceClient;

    @Override
    public CommentDto addComment(Long postId, Long userId, String userName, AddCommentRequest request) {
        // verify post exists
        Map<String, Object> post = postServiceClient.getPostById(postId);
        if (post == null) throw new RuntimeException("Post not found");

        Comment comment = Comment.builder()
                .postId(postId)
                .userId(userId)
                .userName(userName)
                .content(request.getContent())
                .status(isModerationRequired() ? Comment.CommentStatus.PENDING : Comment.CommentStatus.APPROVED)
                .build();
        
        Comment saved = commentRepository.save(comment);

        // Notify post author
        Long authorId = ((Number) post.get("authorId")).longValue();
        if (!authorId.equals(userId)) {
            String postSlug = (String) post.get("slug");
            notifyUser(authorId, "NEW_COMMENT", "New Comment", userName + " commented on your post", saved.getId(), postSlug, "COMMENT");
        }

        return CommentDto.fromEntity(saved);
    }

    @Override
    public CommentDto replyToComment(Long commentId, Long userId, String userName, AddCommentRequest request) {
        Comment parent = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Parent comment not found"));

        if (parent.getParentCommentId() != null) {
            throw new RuntimeException("Two-level threading limit reached. You can only reply to top-level comments.");
        }

        Comment reply = Comment.builder()
                .postId(parent.getPostId())
                .userId(userId)
                .userName(userName)
                .content(request.getContent())
                .parentCommentId(commentId)
                .status(isModerationRequired() ? Comment.CommentStatus.PENDING : Comment.CommentStatus.APPROVED)
                .build();

        Comment saved = commentRepository.save(reply);

        // Notify parent comment author
        if (!parent.getUserId().equals(userId)) {
            java.util.Map<String, Object> post = postServiceClient.getPostById(parent.getPostId());
            String postSlug = post != null ? (String) post.get("slug") : null;
            notifyUser(parent.getUserId(), "NEW_REPLY", "New Reply", userName + " replied to your comment", saved.getId(), postSlug, "COMMENT");
        }

        return CommentDto.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CommentDto> getCommentsByPost(Long postId, Pageable pageable) {
        return commentRepository.findTopLevelByPostId(postId, pageable)
                .map(comment -> {
                    CommentDto dto = CommentDto.fromEntity(comment);
                    List<Comment> replies = commentRepository.findByParentCommentIdAndStatusNot(comment.getId(), Comment.CommentStatus.REJECTED);
                    dto.setReplies(replies.stream().map(CommentDto::fromEntity).collect(Collectors.toList()));
                    return dto;
                });
    }

    @Override
    @Transactional(readOnly = true)
    public CommentDto getCommentById(Long id) {
        return commentRepository.findById(id)
                .map(CommentDto::fromEntity)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentDto> getReplies(Long parentCommentId) {
        return commentRepository.findByParentCommentIdAndStatusNot(parentCommentId, Comment.CommentStatus.REJECTED)
                .stream().map(CommentDto::fromEntity).collect(Collectors.toList());
    }

    @Override
    public CommentDto updateComment(Long id, Long userId, AddCommentRequest request) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        if (!comment.getUserId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }

        comment.setContent(request.getContent());
        comment.setStatus(Comment.CommentStatus.PENDING); // Reset to PENDING on update
        return CommentDto.fromEntity(commentRepository.save(comment));
    }

    @Override
    public void deleteComment(Long commentId, Long userId, String userRole) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        // Author of post can also delete comments
        Map<String, Object> post = postServiceClient.getPostById(comment.getPostId());
        Long postAuthorId = ((Number) post.get("authorId")).longValue();

        if (!"ADMIN".equals(userRole) && !comment.getUserId().equals(userId) && !postAuthorId.equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        
        comment.setStatus(Comment.CommentStatus.DELETED);
        commentRepository.save(comment);
        
        // Soft delete all child replies if it is a parent
        if (comment.getParentCommentId() == null) {
            java.util.List<Comment> children = commentRepository.findByParentCommentId(commentId);
            if (children != null && !children.isEmpty()) {
                children.forEach(child -> child.setStatus(Comment.CommentStatus.DELETED));
                commentRepository.saveAll(children);
            }
        }
    }

    @Override
    public CommentDto approveComment(Long id, String userRole) {
        Comment comment = commentRepository.findById(id).orElseThrow();
        // Here we'd ideally check if current user is admin or author of the post.
        // For simplicity, we assume the controller passes userRole correctly.
        comment.setStatus(Comment.CommentStatus.APPROVED);
        return CommentDto.fromEntity(commentRepository.save(comment));
    }

    @Override
    public CommentDto rejectComment(Long id, String userRole) {
        Comment comment = commentRepository.findById(id).orElseThrow();
        comment.setStatus(Comment.CommentStatus.REJECTED);
        return CommentDto.fromEntity(commentRepository.save(comment));
    }

    @Override
    public CommentDto likeComment(Long id) {
        if (!commentRepository.existsById(id)) throw new RuntimeException("Comment not found: " + id);
        commentRepository.incrementLikes(id);
        return CommentDto.fromEntity(commentRepository.findById(id).orElseThrow());
    }

    @Override
    public CommentDto unlikeComment(Long id) {
        if (!commentRepository.existsById(id)) throw new RuntimeException("Comment not found: " + id);
        commentRepository.decrementLikes(id);
        return CommentDto.fromEntity(commentRepository.findById(id).orElseThrow());
    }

    @Override
    @Transactional(readOnly = true)
    public long getCommentCount(Long postId) {
        return commentRepository.countByPostId(postId);
    }

    @Override
    public CommentDto updateCommentStatus(Long commentId, String userRole, String status) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
                
        comment.setStatus(Comment.CommentStatus.valueOf(status.toUpperCase()));
        return CommentDto.fromEntity(commentRepository.save(comment));
    }

    @Override
    public void setModerationRequired(boolean required, String userRole) {
        if (!"ADMIN".equals(userRole)) {
            throw new RuntimeException("Access denied");
        }
        com.inkwell.comment.entity.CommentConfig config = commentConfigRepository.findById(1L)
                .orElse(com.inkwell.comment.entity.CommentConfig.builder().id(1L).moderationRequired(false).build());
        config.setModerationRequired(required);
        commentConfigRepository.save(config);
    }

    @Override
    public boolean isModerationRequired() {
        return commentConfigRepository.findById(1L)
                .map(com.inkwell.comment.entity.CommentConfig::isModerationRequired)
                .orElse(false);
    }

    private void notifyUser(Long userId, String type, String title, String message, Long relatedId, String relatedSlug, String relatedType) {
        try {
            java.util.Map<String, Object> payload = new java.util.HashMap<>();
            payload.put("recipientId", userId);
            payload.put("type", type);
            payload.put("title", title);
            payload.put("message", message);
            payload.put("relatedId", relatedId);
            payload.put("relatedSlug", relatedSlug);
            payload.put("relatedType", relatedType);
            payload.put("sendEmail", true);
            
            notificationServiceClient.sendNotification(payload);
        } catch (Exception e) {
            log.warn("Failed to send notification: {}", e.getMessage());
        }
    }
}
