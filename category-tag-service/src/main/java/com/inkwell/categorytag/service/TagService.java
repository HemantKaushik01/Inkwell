package com.inkwell.categorytag.service;

import com.inkwell.categorytag.entity.PostTag;
import com.inkwell.categorytag.entity.Tag;
import com.inkwell.categorytag.repository.PostTagRepository;
import com.inkwell.categorytag.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class TagService {
    private final TagRepository tagRepository;
    private final PostTagRepository postTagRepository;

    public Tag createTag(Tag tag) {
        if (tagRepository.existsByName(tag.getName())) {
            return tagRepository.findBySlug(generateSlug(tag.getName())).orElseThrow();
        }
        tag.setSlug(generateSlug(tag.getName()));
        return tagRepository.save(tag);
    }

    @Transactional(readOnly = true)
    public List<Tag> getAllTags() {
        return tagRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Tag> getTagBySlug(String slug) {
        return tagRepository.findBySlug(slug);
    }

    @Transactional(readOnly = true)
    public List<Tag> getTrendingTags() {
        return tagRepository.findTrendingTags(PageRequest.of(0, 10));
    }

    @Transactional(readOnly = true)
    public List<Tag> getTagsByPost(Long postId) {
        return tagRepository.findByPostId(postId);
    }

    public void addTagToPost(Long postId, Long tagId) {
        if (postTagRepository.findByPostIdAndTagId(postId, tagId).isEmpty()) {
            postTagRepository.save(PostTag.builder().postId(postId).tagId(tagId).build());
            tagRepository.findById(tagId).ifPresent(tag -> {
                tag.setPostCount(tag.getPostCount() + 1);
                tagRepository.save(tag);
            });
        }
    }

    public void removeTagFromPost(Long postId, Long tagId) {
        postTagRepository.findByPostIdAndTagId(postId, tagId).ifPresent(pt -> {
            postTagRepository.delete(pt);
            tagRepository.findById(tagId).ifPresent(tag -> {
                if (tag.getPostCount() > 0) {
                    tag.setPostCount(tag.getPostCount() - 1);
                    tagRepository.save(tag);
                }
            });
        });
    }

    private String generateSlug(String name) {
        return name.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .trim();
    }
}
