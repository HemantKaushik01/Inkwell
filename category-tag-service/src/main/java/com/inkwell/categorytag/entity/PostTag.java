package com.inkwell.categorytag.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "post_tags", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"post_id", "tag_id"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostTag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "post_id", nullable = false)
    private Long postId;

    @Column(name = "tag_id", nullable = false)
    private Long tagId;
}
