package com.inkwell.comment.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "comment_config")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentConfig {

    @Id
    @Builder.Default
    private Long id = 1L;

    @Builder.Default
    private boolean moderationRequired = false;
}
