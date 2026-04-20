package com.inkwell.newsletter.service;

import com.inkwell.newsletter.entity.Subscriber;
import com.inkwell.newsletter.repository.SubscriberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NewsletterService {

    private final SubscriberRepository subscriberRepository;

    public String subscribe(String email) {
        if (subscriberRepository.existsByEmail(email)) {
            return "Already subscribed";
        }
        Subscriber subscriber = Subscriber.builder()
                .email(email)
                .token(UUID.randomUUID().toString())
                .confirmed(false)
                .build();
        subscriberRepository.save(subscriber);
        log.info("Send confirmation email to {} with token {}", email, subscriber.getToken());
        return "Please check your email to confirm subscription";
    }

    public String confirmSubscription(String token) {
        Subscriber subscriber = subscriberRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid token"));
        subscriber.setConfirmed(true);
        subscriber.setToken(null);
        subscriberRepository.save(subscriber);
        return "Subscription confirmed";
    }

    public void unsubscribe(String email) {
        subscriberRepository.findByEmail(email).ifPresent(subscriberRepository::delete);
    }

    public void broadcast(String subject, String content) {
        long count = subscriberRepository.findAll().stream().filter(Subscriber::isConfirmed).count();
        log.info("Broadcasting email '{}' to {} confirmed subscribers", subject, count);
        // In a real app we would use RabbitMQ to queue these and send via JavaMailSender
    }
}
