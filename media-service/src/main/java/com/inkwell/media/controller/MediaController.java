package com.inkwell.media.controller;

import com.inkwell.media.entity.Media;
import com.inkwell.media.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/media")
@CrossOrigin(origins = "*")
public class MediaController {

    private final MediaService mediaService;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @PostMapping("/upload")
    public ResponseEntity<Media> uploadMedia(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(mediaService.uploadMedia(file, userId));
    }

    @GetMapping
    public ResponseEntity<List<Media>> getAllMedia(@RequestHeader(value = "X-User-Role", defaultValue = "READER") String userRole) {
        if (!"ADMIN".equals(userRole)) {
            throw new RuntimeException("Access denied");
        }
        return ResponseEntity.ok(mediaService.getAllMedia());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Media> getMediaById(@PathVariable Long id) {
        return ResponseEntity.ok(mediaService.getMediaById(id));
    }

    @GetMapping("/uploader")
    public ResponseEntity<List<Media>> getMediaByUploader(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(mediaService.getMediaByUploader(userId));
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<List<Media>> getMediaByPost(@PathVariable Long postId) {
        return ResponseEntity.ok(mediaService.getMediaByPost(postId));
    }

    @PutMapping("/{id}/alt-text")
    public ResponseEntity<Media> updateAltText(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(mediaService.updateAltText(id, body.get("altText")));
    }

    @PostMapping("/{id}/link/{postId}")
    public ResponseEntity<Void> linkToPost(@PathVariable Long id, @PathVariable Long postId) {
        mediaService.linkToPost(id, postId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/unlink")
    public ResponseEntity<Void> unlinkFromPost(@PathVariable Long id) {
        mediaService.unlinkFromPost(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteMedia(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader(value = "X-User-Role", defaultValue = "READER") String userRole) {
        mediaService.deleteMedia(id, userId, userRole);
        return ResponseEntity.ok(Map.of("message", "Deleted successfully"));
    }

    @PostMapping("/cleanup")
    public ResponseEntity<Void> cleanup(@RequestHeader(value = "X-User-Role", defaultValue = "READER") String userRole) {
        if (!"ADMIN".equals(userRole)) {
            throw new RuntimeException("Access denied");
        }
        mediaService.cleanupDeleted();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/view/{fileName:.+}")
    public ResponseEntity<Resource> viewFile(@PathVariable String fileName) {
        try {
            Path fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
            Path filePath = fileStorageLocation.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists()) {
                String contentType = "image/jpeg"; // Default
                if (fileName.toLowerCase().endsWith(".png")) contentType = "image/png";
                if (fileName.toLowerCase().endsWith(".webp")) contentType = "image/webp";
                if (fileName.toLowerCase().endsWith(".gif")) contentType = "image/gif";

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .body(resource);
            } else {
                throw new RuntimeException("File not found " + fileName);
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("File not found " + fileName, ex);
        }
    }

    @GetMapping("/download/{fileName:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName) {
        try {
            Path fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
            Path filePath = fileStorageLocation.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_OCTET_STREAM)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                throw new RuntimeException("File not found " + fileName);
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("File not found " + fileName, ex);
        }
    }
}
