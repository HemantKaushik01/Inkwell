package com.inkwell.categorytag;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class CategoryTagServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(CategoryTagServiceApplication.class, args);
    }
}
