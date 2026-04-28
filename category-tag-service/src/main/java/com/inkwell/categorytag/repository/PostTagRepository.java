package com.inkwell.categorytag.repository;

import com.inkwell.categorytag.entity.PostTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostTagRepository extends JpaRepository<PostTag, Long> {
    List<PostTag> findByPostId(Long postId);
    Optional<PostTag> findByPostIdAndTagId(Long postId, Long tagId);
    void deleteByPostIdAndTagId(Long postId, Long tagId);
    void deleteByPostId(Long postId);
}
