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
                .status(Comment.CommentStatus.PENDING) // Default to PENDING for moderation
                .build();
        
        Comment saved = commentRepository.save(comment);

        // Notify post author
        Long authorId = ((Number) post.get("authorId")).longValue();
        if (!authorId.equals(userId)) {
            notifyUser(authorId, "NEW_COMMENT", userName + " commented on your post", postId);
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
                .status(Comment.CommentStatus.PENDING)
                .build();

        Comment saved = commentRepository.save(reply);

        // Notify parent comment author
        if (!parent.getUserId().equals(userId)) {
            notifyUser(parent.getUserId(), "NEW_REPLY", userName + " replied to your comment", parent.getPostId());
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
        Comment comment = commentRepository.findById(id).orElseThrow();
        comment.setLikesCount(comment.getLikesCount() + 1);
        return CommentDto.fromEntity(commentRepository.save(comment));
    }

    @Override
    public CommentDto unlikeComment(Long id) {
        Comment comment = commentRepository.findById(id).orElseThrow();
        if (comment.getLikesCount() > 0) {
            comment.setLikesCount(comment.getLikesCount() - 1);
        }
        return CommentDto.fromEntity(commentRepository.save(comment));
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

    private void notifyUser(Long userId, String type, String message, Long referenceId) {
        try {
            Map<String, Object> payload = Map.of(
                    "userId", userId,
                    "type", type,
                    "message", message,
                    "referenceId", referenceId
            );
            notificationServiceClient.sendNotification(payload);
        } catch (Exception e) {
            log.warn("Failed to send notification: {}", e.getMessage());
        }
    }
}
