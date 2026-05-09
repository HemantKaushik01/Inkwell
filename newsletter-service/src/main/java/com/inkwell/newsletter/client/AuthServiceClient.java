package com.inkwell.newsletter.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.Map;

@FeignClient(name = "auth-service")
public interface AuthServiceClient {
    @PostMapping("/api/users/find-by-emails")
    List<Map<String, Object>> findByEmails(@RequestBody List<String> emails);
}
