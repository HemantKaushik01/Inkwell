package com.inkwell.post.service;

import com.inkwell.post.client.AuthServiceClient;
import com.inkwell.post.client.NotificationServiceClient;
import com.inkwell.post.dto.CreatePostRequest;
import com.inkwell.post.dto.PostDto;
import com.inkwell.post.entity.Post;
import com.inkwell.post.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final AuthServiceClient authServiceClient;
    private final NotificationServiceClient notificationServiceClient;

    @Override
    public PostDto createPost(Long authorId, String authorName, CreatePostRequest request) {
        String slug = generateSlug(request.getTitle());
        // make slug unique
        String uniqueSlug = slug;
        int counter = 1;
        while (postRepository.findBySlug(uniqueSlug).isPresent()) {
            uniqueSlug = slug + "-" + counter++;
        }

        Post.PostStatus status = Post.PostStatus.DRAFT;
        if ("PUBLISHED".equalsIgnoreCase(request.getStatus())) {
            status = Post.PostStatus.PUBLISHED;
        }

        int readTime = calculateReadTime(request.getContent());

        Post post = Post.builder()
                .title(request.getTitle())
                .slug(uniqueSlug)
                .content(request.getContent())
                .authorId(authorId)
                .authorName(authorName)
                .status(status)
                .categoryId(request.getCategoryId())
                .coverImageUrl(request.getCoverImageUrl())
                .tags(request.getTags() != null ? request.getTags() : new java.util.HashSet<>())
                .readTime(readTime)
                .viewCount(0L)
                .likeCount(0L)
                .publishedAt(status == Post.PostStatus.PUBLISHED ? LocalDateTime.now() : null)
                .build();

        Post saved = postRepository.save(post);

        // Notify followers if published
        if (status == Post.PostStatus.PUBLISHED) {
            notifyFollowers(authorId, authorName, saved);
        }

        return PostDto.fromEntity(saved);
    }

    @Override
    public PostDto updatePost(Long postId, Long userId, String userRole, CreatePostRequest request) {
        Post post = findById(postId);
        checkOwnership(post, userId, userRole);

        if (request.getTitle() != null) post.setTitle(request.getTitle());
        if (request.getContent() != null) {
            post.setContent(request.getContent());
            post.setReadTime(calculateReadTime(request.getContent()));
        }
        if (request.getCategoryId() != null) post.setCategoryId(request.getCategoryId());
        if (request.getCoverImageUrl() != null) post.setCoverImageUrl(request.getCoverImageUrl());
        if (request.getTags() != null) post.setTags(request.getTags());

        boolean wasPublished = post.getStatus() != Post.PostStatus.PUBLISHED;
        if (request.getStatus() != null) {
            Post.PostStatus newStatus = Post.PostStatus.valueOf(request.getStatus().toUpperCase());
            if (newStatus == Post.PostStatus.PUBLISHED && wasPublished) {
                post.setPublishedAt(LocalDateTime.now());
                notifyFollowers(post.getAuthorId(), post.getAuthorName(), post);
            }
            post.setStatus(newStatus);
        }

        return PostDto.fromEntity(postRepository.save(post));
    }

    @Override
    public void deletePost(Long postId, Long userId, String userRole) {
        Post post = findById(postId);
        checkOwnership(post, userId, userRole);
        postRepository.delete(post);
    }

    @Override
    @Transactional(readOnly = true)
    public PostDto getPostById(Long id) {
        return PostDto.fromEntity(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public PostDto getPostBySlug(String slug) {
        Post post = postRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Post not found with slug: " + slug));
        return PostDto.fromEntity(post);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PostDto> getAllPublishedPosts(Pageable pageable) {
        return postRepository.findByStatus(Post.PostStatus.PUBLISHED, pageable)
                .map(PostDto::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PostDto> searchPosts(String query, Pageable pageable) {
        return postRepository.searchPublished(query, pageable).map(PostDto::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostDto> getPostsByAuthor(Long authorId) {
        return postRepository.findByAuthorId(authorId).stream()
                .map(PostDto::fromEntity).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostDto> getFeaturedPosts() {
        return postRepository.findFeaturedPosts().stream()
                .map(PostDto::fromEntity).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostDto> getTrendingPosts() {
        return postRepository.findTrendingPosts(PageRequest.of(0, 10)).stream()
                .map(PostDto::fromEntity).collect(Collectors.toList());
    }

    @Override
    public void incrementViewCount(Long postId) {
        if (!postRepository.existsById(postId)) {
            throw new RuntimeException("Post not found: " + postId);
        }
        postRepository.incrementViewCount(postId);
    }

    @Override
    public void incrementLikeCount(Long postId) {
        if (!postRepository.existsById(postId)) {
            throw new RuntimeException("Post not found: " + postId);
        }
        postRepository.incrementLikeCount(postId);
    }

    @Override
    public PostDto updateStatus(Long postId, Long userId, String userRole, String status) {
        Post post = findById(postId);
        checkOwnership(post, userId, userRole);
        Post.PostStatus newStatus = Post.PostStatus.valueOf(status.toUpperCase());
        if (newStatus == Post.PostStatus.PUBLISHED && post.getStatus() != Post.PostStatus.PUBLISHED) {
            post.setPublishedAt(LocalDateTime.now());
            notifyFollowers(post.getAuthorId(), post.getAuthorName(), post);
        }
        post.setStatus(newStatus);
        return PostDto.fromEntity(postRepository.save(post));
    }

    @Override
    public PostDto featurePost(Long postId, boolean featured) {
        Post post = findById(postId);
        post.setFeatured(featured);
        return PostDto.fromEntity(postRepository.save(post));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PostDto> getPostsByCategory(Long categoryId, Pageable pageable) {
        return postRepository.findByCategoryIdAndStatus(categoryId, Post.PostStatus.PUBLISHED, pageable)
                .map(PostDto::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public long countByAuthor(Long authorId) {
        return postRepository.countByAuthorId(authorId);
    }

    private void checkOwnership(Post post, Long userId, String userRole) {
        if (!"ADMIN".equals(userRole) && !post.getAuthorId().equals(userId)) {
            throw new RuntimeException("Access denied: you do not own this post");
        }
    }

    private void notifyFollowers(Long authorId, String authorName, Post post) {
        try {
            List<Long> followerIds = authServiceClient.getFollowerIds(authorId);
            if (followerIds != null && !followerIds.isEmpty()) {
                Map<String, Object> payload = Map.of(
                        "userIds", followerIds,
                        "type", "NEW_POST",
                        "message", authorName + " published a new post: " + post.getTitle(),
                        "referenceId", post.getId()
                );
                notificationServiceClient.sendBulkNotification(payload);
            }
        } catch (Exception e) {
            log.warn("Failed to send notifications: {}", e.getMessage());
        }
    }

    private Post findById(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found: " + id));
    }

    private String generateSlug(String title) {
        return title.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .trim();
    }

    private int calculateReadTime(String content) {
        if (content == null || content.isEmpty()) return 1;
        int wordCount = content.split("\\s+").length;
        return Math.max(1, wordCount / 200);
    }
}
