package com.inkwell.auth.dto;

import com.inkwell.auth.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private User.Role role;
    private User.Provider provider;
    private boolean isActive;
    private String bio;
    private String avatarUrl;
    private int followersCount;
    private int followingCount;
    private LocalDateTime createdAt;

    public static UserDto fromEntity(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .provider(user.getProvider())
                .isActive(user.isActive())
                .bio(user.getBio())
                .avatarUrl(user.getAvatarUrl())
                .followersCount(user.getFollowers() != null ? user.getFollowers().size() : 0)
                .followingCount(user.getFollowing() != null ? user.getFollowing().size() : 0)
                .createdAt(user.getCreatedAt())
                .build();
    }
}
