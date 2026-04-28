package com.inkwell.analytics.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.Map;

@FeignClient(name = "post-service")
public interface PostServiceClient {
    @GetMapping("/api/posts")
    Map<String, Object> getAllPosts();

    @GetMapping("/api/posts/author/{authorId}")
    List<Map<String, Object>> getPostsByAuthor(@PathVariable Long authorId);

    @GetMapping("/api/posts/trending")
    List<Map<String, Object>> getTrendingPosts();
}
