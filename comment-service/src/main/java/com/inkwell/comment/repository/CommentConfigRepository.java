package com.inkwell.comment.repository;

import com.inkwell.comment.entity.CommentConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentConfigRepository extends JpaRepository<CommentConfig, Long> {
}
