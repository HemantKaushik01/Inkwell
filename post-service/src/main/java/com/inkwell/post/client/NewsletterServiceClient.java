package com.inkwell.post.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "newsletter-service")
public interface NewsletterServiceClient {
    @PostMapping("/api/internal/newsletter/dispatch-new-post")
    void dispatchNewPost(@RequestBody Map<String, Object> payload);
}
