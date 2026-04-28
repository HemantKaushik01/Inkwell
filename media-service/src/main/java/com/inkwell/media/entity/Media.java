package com.inkwell.media.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "media")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Media {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String filename;

    @Column(name = "original_name")
    private String originalName;

    @Column(nullable = false)
    private String url;

    @Column(name = "mime_type")
    private String mimeType;

    @Column(name = "size_kb")
    private Long sizeKb;

    @Column(name = "alt_text")
    private String altText;

    @Column(name = "linked_post_id")
    private Long linkedPostId;

    @Column(name = "uploader_id", nullable = false)
    private Long uploaderId;

    @CreationTimestamp
    @Column(name = "uploaded_at", updatable = false)
    private LocalDateTime uploadedAt;

    @Column(name = "is_deleted")
    @Builder.Default
    private boolean deleted = false;
}
