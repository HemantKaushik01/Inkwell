package com.inkwell.comment.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(name = "post-service")
public interface PostServiceClient {
    @GetMapping("/api/posts/{id}")
    Map<String, Object> getPostById(@PathVariable Long id);
}
