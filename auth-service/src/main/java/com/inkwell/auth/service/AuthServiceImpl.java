package com.inkwell.auth.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.inkwell.auth.dto.*;
import com.inkwell.auth.entity.User;
import com.inkwell.auth.repository.UserRepository;
import com.inkwell.auth.client.NotificationServiceClient;
import com.inkwell.auth.security.GoogleTokenVerifier;
import com.inkwell.auth.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final GoogleTokenVerifier googleTokenVerifier;
    private final NotificationServiceClient notificationServiceClient;

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already taken");
        }

        User.Role role = User.Role.READER;
        if ("AUTHOR".equalsIgnoreCase(request.getRole())) {
            role = User.Role.AUTHOR;
        }

        User user = User.builder()
                .username(request.getUsername())
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .provider(User.Provider.LOCAL)
                .isActive(true)
                .build();

        User saved = userRepository.save(user);
        return buildAuthResponse(saved);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!user.isActive()) {
            throw new RuntimeException("Account suspended");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        return buildAuthResponse(user);
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtTokenProvider.isTokenValid(refreshToken)) {
            throw new RuntimeException("Invalid refresh token");
        }
        String userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
        User user = userRepository.findById(Long.parseLong(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));
        return buildAuthResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getProfile(Long userId) {
        User user = findById(userId);
        return UserDto.fromEntity(user);
    }

    @Override
    public UserDto updateProfile(Long userId, UpdateProfileRequest request) {
        User user = findById(userId);
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getUsername() != null && !request.getUsername().equals(user.getUsername())) {
             if (userRepository.existsByUsername(request.getUsername())) {
                 throw new RuntimeException("Username already taken");
             }
             user.setUsername(request.getUsername());
        }
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());
        return UserDto.fromEntity(userRepository.save(user));
    }

    @Override
    public void followUser(Long followerId, Long targetId) {
        User follower = findById(followerId);
        User target = findById(targetId);
        follower.getFollowing().add(target);
        userRepository.save(follower);
        
        try {
            java.util.Map<String, Object> payload = new java.util.HashMap<>();
            payload.put("recipientId", targetId);
            payload.put("actorId", followerId);
            payload.put("type", "NEW_FOLLOWER");
            payload.put("title", "New Follower");
            payload.put("message", follower.getUsername() + " started following you!");
            payload.put("relatedId", followerId);
            payload.put("relatedType", "USER");
            notificationServiceClient.sendNotification(payload);
        } catch (Exception e) {
            // log the error and continue
        }
    }

    @Override
    public void unfollowUser(Long followerId, Long targetId) {
        User follower = findById(followerId);
        User target = findById(targetId);
        follower.getFollowing().remove(target);
        userRepository.save(follower);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDto> getFollowers(Long userId) {
        User user = findById(userId);
        return user.getFollowers().stream().map(UserDto::fromEntity).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDto> getFollowing(Long userId) {
        User user = findById(userId);
        return user.getFollowing().stream().map(UserDto::fromEntity).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDto> getAllAuthors() {
        return userRepository.findAllActiveAuthors().stream()
                .map(UserDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public void suspendUser(Long userId) {
        User user = findById(userId);
        user.setActive(false);
        userRepository.save(user);
    }

    @Override
    public void activateUser(Long userId) {
        User user = findById(userId);
        user.setActive(true);
        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getUserById(Long userId) {
        return UserDto.fromEntity(findById(userId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Long> getFollowerIds(Long authorId) {
        User author = findById(authorId);
        return author.getFollowers().stream().map(User::getId).collect(Collectors.toList());
    }

    @Override
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = findById(userId);
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid old password");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDto> searchUsers(String query) {
        return userRepository.findByUsernameContainingIgnoreCase(query).stream()
                .map(UserDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public void deactivateAccount(Long userId) {
        User user = findById(userId);
        user.setActive(false);
        userRepository.save(user);
    }

    @Override
    public AuthResponse handleOAuthLogin(OAuthLoginRequest request) {
        // 1. Verify the Google ID Token with Google's servers
        GoogleIdToken.Payload payload = googleTokenVerifier.verify(request.getIdToken());

        // 2. Extract user info from the verified payload (safe — comes from Google)
        String email    = payload.getEmail();
        String fullName = (String) payload.get("name");
        String avatar   = (String) payload.get("picture");

        // 3. Find or create the user in our DB
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            String username = email.split("@")[0] + "_" + System.currentTimeMillis();
            user = User.builder()
                    .email(email)
                    .username(username)
                    .fullName(fullName != null ? fullName : email.split("@")[0])
                    .password(passwordEncoder.encode("GOOGLE_OAUTH_" + System.currentTimeMillis()))
                    .role(User.Role.READER)
                    .provider(User.Provider.GOOGLE)
                    .avatarUrl(avatar)
                    .isActive(true)
                    .build();
            user = userRepository.save(user);
        } else {
            if (!user.isActive()) throw new RuntimeException("Account suspended");
            // Update avatar from Google if we don't have one yet
            if (avatar != null && user.getAvatarUrl() == null) {
                user.setAvatarUrl(avatar);
                user = userRepository.save(user);
            }
        }
        return buildAuthResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getUserByEmail(String email) {
        return UserDto.fromEntity(userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found")));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDto> findByEmails(List<String> emails) {
        return userRepository.findByEmailIn(emails).stream()
                .map(UserDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public void changeUserRole(Long userId, String role) {
        User user = findById(userId);
        user.setRole(User.Role.valueOf(role.toUpperCase()));
        userRepository.save(user);
    }

    @Override
    public void deleteUser(Long userId) {
        User user = findById(userId);
        
        // Disconnect from followers to avoid constraint violations
        for (User follower : user.getFollowers()) {
            follower.getFollowing().remove(user);
            userRepository.save(follower);
        }
        
        // Also clear following simply for consistency
        user.getFollowing().clear();
        
        userRepository.delete(user);
    }

    private User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(
                String.valueOf(user.getId()), user.getEmail(), user.getRole().name(), user.getFullName());
        String refreshToken = jwtTokenProvider.generateRefreshToken(String.valueOf(user.getId()));
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(UserDto.fromEntity(user))
                .build();
    }
}
