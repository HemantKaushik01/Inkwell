package com.inkwell.media.service;

import com.inkwell.media.entity.Media;
import com.inkwell.media.repository.MediaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class MediaServiceImpl implements MediaService {

    private final MediaRepository mediaRepository;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Override
    public Media uploadMedia(MultipartFile file, Long uploaderId) {
        try {
            Path fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(fileStorageLocation);

            String originalName = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "file");
            String extension = originalName.contains(".") ? originalName.substring(originalName.lastIndexOf(".")) : "";
            String fileName = UUID.randomUUID().toString() + extension;

            Path targetLocation = fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // In a real S3 setup, this would be the S3 URL. 
            // For local, we point to our serving endpoint.
            String fileDownloadUri = "/api/media/view/" + fileName;

            Media media = Media.builder()
                    .filename(fileName)
                    .originalName(originalName)
                    .url(fileDownloadUri)
                    .mimeType(file.getContentType())
                    .sizeKb(file.getSize() / 1024)
                    .uploaderId(uploaderId)
                    .deleted(false)
                    .build();

            return mediaRepository.save(media);
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file. Please try again!", ex);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<Media> getAllMedia() {
        return mediaRepository.findByDeleted(false);
    }

    @Override
    public void deleteMedia(Long id, Long uploaderId, String userRole) {
        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Media not found"));

        if (!"ADMIN".equals(userRole) && !media.getUploaderId().equals(uploaderId)) {
            throw new RuntimeException("Access denied");
        }

        // Soft delete as per requirements
        media.setDeleted(true);
        mediaRepository.save(media);
    }

    @Override
    @Transactional(readOnly = true)
    public Media getMediaById(Long id) {
        return mediaRepository.findById(id)
                .filter(m -> !m.isDeleted())
                .orElseThrow(() -> new RuntimeException("Media not found or deleted"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Media> getMediaByUploader(Long uploaderId) {
        return mediaRepository.findByUploaderId(uploaderId).stream()
                .filter(m -> !m.isDeleted())
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Media> getMediaByPost(Long postId) {
        return mediaRepository.findByLinkedPostId(postId);
    }

    @Override
    public Media updateAltText(Long id, String altText) {
        Media media = getMediaById(id);
        media.setAltText(altText);
        return mediaRepository.save(media);
    }

    @Override
    public void linkToPost(Long id, Long postId) {
        Media media = getMediaById(id);
        media.setLinkedPostId(postId);
        mediaRepository.save(media);
    }

    @Override
    public void unlinkFromPost(Long id) {
        Media media = getMediaById(id);
        media.setLinkedPostId(null);
        mediaRepository.save(media);
    }

    @Override
    public void cleanupDeleted() {
        List<Media> toDelete = mediaRepository.findByDeleted(true);
        for (Media media : toDelete) {
            try {
                Path fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
                Path filePath = fileStorageLocation.resolve(media.getFilename()).normalize();
                Files.deleteIfExists(filePath);
                mediaRepository.delete(media);
            } catch (IOException ex) {
                log.error("Failed to cleanup file: " + media.getFilename(), ex);
            }
        }
    }
}
