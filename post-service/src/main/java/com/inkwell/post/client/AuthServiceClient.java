package com.inkwell.post.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.Map;

@FeignClient(name = "auth-service")
public interface AuthServiceClient {
    @GetMapping("/api/users/{id}/followers/ids")
    List<Long> getFollowerIds(@PathVariable Long id);

    @GetMapping("/api/users/{id}")
    Map<String, Object> getUserById(@PathVariable Long id);
}
