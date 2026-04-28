package com.inkwell.auth.service;

import com.inkwell.auth.dto.*;
import com.inkwell.auth.entity.User;

import java.util.List;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse refreshToken(String refreshToken);
    UserDto getProfile(Long userId);
    UserDto updateProfile(Long userId, UpdateProfileRequest request);
    void followUser(Long followerId, Long targetId);
    void unfollowUser(Long followerId, Long targetId);
    List<UserDto> getFollowers(Long userId);
    List<UserDto> getFollowing(Long userId);
    List<UserDto> getAllAuthors();
    void suspendUser(Long userId);
    void activateUser(Long userId);
    UserDto getUserById(Long userId);
    List<Long> getFollowerIds(Long authorId);
    
    // New methods from PDF case study
    void changePassword(Long userId, ChangePasswordRequest request);
    List<UserDto> searchUsers(String query);
    void deactivateAccount(Long userId);
    AuthResponse handleOAuthLogin(OAuthLoginRequest request);
    UserDto getUserByEmail(String email);

    // Admin ops
    List<UserDto> getAllUsers();
    void changeUserRole(Long userId, String role);
    void deleteUser(Long userId);
}
