package com.inkwell.categorytag.config;

import com.inkwell.categorytag.entity.Tag;
import com.inkwell.categorytag.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class TagSeeder implements CommandLineRunner {

    private final TagRepository tagRepository;

    @Override
    public void run(String... args) {
        if (tagRepository.count() == 0) {
            log.info("Seeding initial tags...");
            List<Tag> tags = List.of(
                Tag.builder().name("Technology").slug("technology").build(),
                Tag.builder().name("Programming").slug("programming").build(),
                Tag.builder().name("Health").slug("health").build(),
                Tag.builder().name("Travel").slug("travel").build(),
                Tag.builder().name("Marketing").slug("marketing").build(),
                Tag.builder().name("Business").slug("business").build(),
                Tag.builder().name("Education").slug("education").build(),
                Tag.builder().name("Art").slug("art").build(),
                Tag.builder().name("Science").slug("science").build(),
                Tag.builder().name("Lifestyle").slug("lifestyle").build()
            );
            tagRepository.saveAll(tags);
            log.info("Seeded {} tags", tags.size());
        }
    }
}
