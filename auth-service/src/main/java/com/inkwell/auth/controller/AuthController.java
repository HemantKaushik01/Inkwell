package com.inkwell.auth.controller;

import com.inkwell.auth.dto.*;
import com.inkwell.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    // Auth endpoints
    @PostMapping("/api/auth/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/api/auth/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/api/auth/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestBody Map<String,String> body) {
        return ResponseEntity.ok(authService.refreshToken(body.get("refreshToken")));
    }

    @PostMapping("/api/auth/logout")
    public ResponseEntity<Map<String,String>> logout() {
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @PostMapping("/api/auth/oauth")
    public ResponseEntity<AuthResponse> handleOAuthLogin(@Valid @RequestBody OAuthLoginRequest request) {
        return ResponseEntity.ok(authService.handleOAuthLogin(request));
    }

    @PutMapping("/api/auth/password")
    public ResponseEntity<Map<String,String>> changePassword(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(userId, request);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    @GetMapping("/api/auth/search")
    public ResponseEntity<List<UserDto>> searchUsers(@RequestParam String query) {
        return ResponseEntity.ok(authService.searchUsers(query));
    }

    @DeleteMapping("/api/auth/deactivate")
    public ResponseEntity<Map<String,String>> deactivateAccount(@RequestHeader("X-User-Id") Long userId) {
        authService.deactivateAccount(userId);
        return ResponseEntity.ok(Map.of("message", "Account deactivated successfully"));
    }

    // User profile endpoints
    @GetMapping("/api/users/profile")
    public ResponseEntity<UserDto> getProfile(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(authService.getProfile(userId));
    }

    @PutMapping("/api/users/profile")
    public ResponseEntity<UserDto> updateProfile(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(authService.updateProfile(userId, request));
    }

    @GetMapping("/api/users/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(authService.getUserById(id));
    }

    @GetMapping("/api/users/authors")
    public ResponseEntity<List<UserDto>> getAllAuthors() {
        return ResponseEntity.ok(authService.getAllAuthors());
    }

    // Follow system
    @PostMapping("/api/users/{id}/follow")
    public ResponseEntity<Map<String,String>> follow(
            @RequestHeader("X-User-Id") Long followerId,
            @PathVariable Long id) {
        authService.followUser(followerId, id);
        return ResponseEntity.ok(Map.of("message", "Followed successfully"));
    }

    @DeleteMapping("/api/users/{id}/follow")
    public ResponseEntity<Map<String,String>> unfollow(
            @RequestHeader("X-User-Id") Long followerId,
            @PathVariable Long id) {
        authService.unfollowUser(followerId, id);
        return ResponseEntity.ok(Map.of("message", "Unfollowed successfully"));
    }

    @GetMapping("/api/users/{id}/followers")
    public ResponseEntity<List<UserDto>> getFollowers(@PathVariable Long id) {
        return ResponseEntity.ok(authService.getFollowers(id));
    }

    @GetMapping("/api/users/{id}/following")
    public ResponseEntity<List<UserDto>> getFollowing(@PathVariable Long id) {
        return ResponseEntity.ok(authService.getFollowing(id));
    }

    @GetMapping("/api/users/{id}/followers/ids")
    public ResponseEntity<List<Long>> getFollowerIds(@PathVariable Long id) {
        return ResponseEntity.ok(authService.getFollowerIds(id));
    }

    // Admin endpoints
    @PutMapping("/api/admin/users/{id}/suspend")
    public ResponseEntity<Map<String,String>> suspendUser(@PathVariable Long id) {
        authService.suspendUser(id);
        return ResponseEntity.ok(Map.of("message", "User suspended"));
    }

    @PutMapping("/api/admin/users/{id}/activate")
    public ResponseEntity<Map<String,String>> activateUser(@PathVariable Long id) {
        authService.activateUser(id);
        return ResponseEntity.ok(Map.of("message", "User activated"));
    }

    @GetMapping("/api/admin/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(authService.getAllUsers());
    }

    @PutMapping("/api/admin/users/{id}/role")
    public ResponseEntity<Map<String,String>> changeUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        authService.changeUserRole(id, body.get("role"));
        return ResponseEntity.ok(Map.of("message", "User role updated successfully"));
    }

    @DeleteMapping("/api/admin/users/{id}")
    public ResponseEntity<Map<String,String>> deleteUser(@PathVariable Long id) {
        authService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", "User completely deleted"));
    }
}
