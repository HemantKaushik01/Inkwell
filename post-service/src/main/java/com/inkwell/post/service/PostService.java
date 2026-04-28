package com.inkwell.post.service;

import com.inkwell.post.dto.CreatePostRequest;
import com.inkwell.post.dto.PostDto;
import com.inkwell.post.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PostService {
    PostDto createPost(Long authorId, String authorName, CreatePostRequest request);
    PostDto updatePost(Long postId, Long userId, String userRole, CreatePostRequest request);
    void deletePost(Long postId, Long userId, String userRole);
    PostDto getPostById(Long id);
    PostDto getPostBySlug(String slug);
    Page<PostDto> getAllPublishedPosts(Pageable pageable);
    Page<PostDto> searchPosts(String query, Pageable pageable);
    List<PostDto> getPostsByAuthor(Long authorId);
    List<PostDto> getFeaturedPosts();
    List<PostDto> getTrendingPosts();
    void incrementViewCount(Long postId);
    PostDto toggleLike(Long postId, Long userId);
    boolean hasUserLiked(Long postId, Long userId);
    PostDto updateStatus(Long postId, Long userId, String userRole, String status);
    PostDto featurePost(Long postId, boolean featured);
    Page<PostDto> getPostsByCategory(Long categoryId, Pageable pageable);
    Page<PostDto> getPostsByTag(String tag, Pageable pageable);
    long countByAuthor(Long authorId);
}
