package com.inkwell.media.repository;

import com.inkwell.media.entity.Media;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MediaRepository extends JpaRepository<Media, Long> {
    List<Media> findByUploaderId(Long uploaderId);
    List<Media> findByLinkedPostId(Long postId);
    List<Media> findByMimeType(String mimeType);
    List<Media> findByDeleted(boolean deleted);
    Long countByUploaderId(Long uploaderId);

    default java.util.Optional<Media> findByMediaId(Long id) {
        return findById(id);
    }
}
