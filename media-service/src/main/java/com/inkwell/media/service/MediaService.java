package com.inkwell.media.service;

import com.inkwell.media.entity.Media;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface MediaService {
    Media uploadMedia(MultipartFile file, Long uploaderId);
    List<Media> getAllMedia();
    void deleteMedia(Long id, Long uploaderId, String userRole);
    Media getMediaById(Long id);
    List<Media> getMediaByUploader(Long uploaderId);
    List<Media> getMediaByPost(Long postId);
    Media updateAltText(Long id, String altText);
    void linkToPost(Long id, Long postId);
    void unlinkFromPost(Long id);
    void cleanupDeleted();
}
