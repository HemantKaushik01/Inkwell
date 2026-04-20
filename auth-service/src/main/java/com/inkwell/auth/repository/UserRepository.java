package com.inkwell.auth.repository;

import com.inkwell.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    List<User> findByRole(User.Role role);
    List<User> findByUsernameContainingIgnoreCase(String query);

    @Query("SELECT u FROM User u WHERE u.role = 'AUTHOR' AND u.isActive = true")
    List<User> findAllActiveAuthors();
}
