package com.inkwell.categorytag.config;

import com.inkwell.categorytag.entity.Category;
import com.inkwell.categorytag.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Stream;

@Component
@RequiredArgsConstructor
@Slf4j
public class CategorySeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    @Override
    public void run(String... args) {
        Stream.of(
            "Tech", "Entertainment", "Sports", "Lifestyle", 
            "Business", "Health", "Science", "Education", 
            "Travel", "Food"
        ).forEach(name -> {
            if (!categoryRepository.existsByName(name)) {
                log.info("Seeding category: {}", name);
                Category category = Category.builder()
                        .name(name)
                        .slug(name.toLowerCase().replace(" ", "-"))
                        .description("Explore stories in " + name)
                        .postCount(0L)
                        .build();
                categoryRepository.save(category);
            }
        });
    }
}
