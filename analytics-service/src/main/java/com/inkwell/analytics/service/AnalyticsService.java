package com.inkwell.analytics.service;

import com.inkwell.analytics.client.AuthServiceClient;
import com.inkwell.analytics.client.PostServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsService {

    private final PostServiceClient postServiceClient;
    private final AuthServiceClient authServiceClient;

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        try {
            Map<String, Object> postData = postServiceClient.getAllPosts();
            if (postData != null && postData.containsKey("totalElements")) {
                stats.put("totalPosts", postData.get("totalElements"));
            } else {
                stats.put("totalPosts", 0);
            }
        } catch (Exception e) {
            log.warn("Could not fetch posts for stats", e);
            stats.put("totalPosts", 0);
        }

        try {
            List<Map<String, Object>> users = authServiceClient.getAllUsers();
            stats.put("totalAuthors", users != null ? users.size() : 0);
            
            int totalFollowers = 0;
            if (users != null) {
                for (Map<String, Object> user : users) {
                    if (user.containsKey("followersCount") && user.get("followersCount") != null) {
                        totalFollowers += ((Number) user.get("followersCount")).intValue();
                    }
                }
            }
            stats.put("totalFollows", totalFollowers);
        } catch (Exception e) {
            log.warn("Could not fetch users for stats", e);
            stats.put("totalAuthors", 0);
            stats.put("totalFollows", 0);
        }

        return stats;
    }

    public Map<String, Object> getAuthorStats(Long authorId) {
        Map<String, Object> stats = new HashMap<>();
        try {
            List<Map<String, Object>> posts = postServiceClient.getPostsByAuthor(authorId);
            stats.put("totalPosts", posts != null ? posts.size() : 0);
            
            long totalViews = 0;
            if (posts != null) {
                for (Map<String, Object> post : posts) {
                    if (post.containsKey("viewCount") && post.get("viewCount") != null) {
                        totalViews += ((Number) post.get("viewCount")).longValue();
                    }
                }
            }
            stats.put("totalViews", totalViews);
        } catch (Exception e) {
            log.warn("Could not fetch author posts", e);
            stats.put("totalPosts", 0);
            stats.put("totalViews", 0);
        }
        return stats;
    }

    public List<Map<String, Object>> getTrending() {
        return postServiceClient.getTrendingPosts();
    }
}
