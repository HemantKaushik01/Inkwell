package com.inkwell.analytics.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;
import java.util.Map;

@FeignClient(name = "auth-service")
public interface AuthServiceClient {
    @GetMapping("/api/admin/users")
    List<Map<String, Object>> getAllUsers();
}
