package com.inkwell.post.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Set;

@Data
public class CreatePostRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String content;
    private Long categoryId;
    private String coverImageUrl;
    private Set<String> tags;
    private String status; // DRAFT or PUBLISHED
}
