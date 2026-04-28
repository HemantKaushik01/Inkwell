package com.inkwell.post.dto;

import com.inkwell.post.entity.Post;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostDto {
    private Long id;
    private String title;
    private String slug;
    private String content;
    private Long authorId;
    private String authorName;
    private Post.PostStatus status;
    private Long categoryId;
    private String coverImageUrl;
    private int readTime;
    private Long viewCount;
    private Long likeCount;
    private boolean featured;
    private boolean likedByCurrentUser;
    private Set<String> tags;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime publishedAt;

    public static PostDto fromEntity(Post post) {
        return PostDto.builder()
                .id(post.getId())
                .title(post.getTitle())
                .slug(post.getSlug())
                .content(post.getContent())
                .authorId(post.getAuthorId())
                .authorName(post.getAuthorName())
                .status(post.getStatus())
                .categoryId(post.getCategoryId())
                .coverImageUrl(post.getCoverImageUrl())
                .readTime(post.getReadTime())
                .viewCount(post.getViewCount())
                .likeCount(post.getLikeCount())
                .featured(post.isFeatured())
                .tags(post.getTags())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .publishedAt(post.getPublishedAt())
                .build();
    }
}
