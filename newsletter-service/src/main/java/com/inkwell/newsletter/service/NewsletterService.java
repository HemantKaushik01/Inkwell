package com.inkwell.newsletter.service;

import com.inkwell.newsletter.client.AuthServiceClient;
import com.inkwell.newsletter.client.NotificationServiceClient;
import com.inkwell.newsletter.entity.Campaign;
import com.inkwell.newsletter.entity.Subscriber;
import com.inkwell.newsletter.repository.CampaignRepository;
import com.inkwell.newsletter.repository.SubscriberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NewsletterService {

    private final SubscriberRepository subscriberRepository;
    private final CampaignRepository campaignRepository;
    private final NotificationServiceClient notificationServiceClient;
    private final AuthServiceClient authServiceClient;

    public String subscribe(String email, Set<String> tags) {
        if (subscriberRepository.existsByEmail(email)) {
            return "Already subscribed";
        }
        Subscriber subscriber = Subscriber.builder()
                .email(email)
                .token(UUID.randomUUID().toString())
                .status(Subscriber.SubscriberStatus.PENDING)
                .tags(tags != null ? tags : new java.util.HashSet<>())
                .build();
        subscriberRepository.save(subscriber);
        
        log.info("Send confirmation email to {} with token {}", email, subscriber.getToken());
        return "Please check your email to confirm subscription";
    }

    public String confirmSubscription(String token) {
        Subscriber subscriber = subscriberRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid token"));
        subscriber.setStatus(Subscriber.SubscriberStatus.ACTIVE);
        subscriber.setToken(null);
        subscriberRepository.save(subscriber);
        
        log.info("Dispatching welcome email to {}", subscriber.getEmail());
        return "Subscription confirmed";
    }

    public void unsubscribe(String email) {
        subscriberRepository.findByEmail(email).ifPresent(subscriberRepository::delete);
    }

    public void broadcast(String subject, String content, List<String> tags) {
        // 1. Save campaign
        Campaign campaign = Campaign.builder()
                .subject(subject)
                .content(content)
                .build();
        campaignRepository.save(campaign);

        // 2. Find subscribers
        List<Subscriber> activeSubscribers = subscriberRepository.findByStatus(Subscriber.SubscriberStatus.ACTIVE);
        
        if (tags != null && !tags.isEmpty()) {
            activeSubscribers = activeSubscribers.stream()
                .filter(s -> s.getTags().stream().anyMatch(tags::contains))
                .collect(Collectors.toList());
        }
        
        log.info("Broadcasting email '{}' to {} ACTIVE subscribers", subject, activeSubscribers.size());
        
        if (activeSubscribers.isEmpty()) return;

        // 3. Send Emails
        List<String> emails = activeSubscribers.stream().map(Subscriber::getEmail).collect(Collectors.toList());
        for (String email : emails) {
            log.info("Sending broadcast to email: {}", email);
        }

        // 4. Send in-app notification to subscribed users
        try {
            List<Map<String, Object>> users = authServiceClient.findByEmails(emails);
            if (users != null && !users.isEmpty()) {
                List<Long> userIds = users.stream()
                        .map(u -> ((Number) u.get("id")).longValue())
                        .collect(Collectors.toList());
                
                Map<String, Object> payload = new HashMap<>();
                payload.put("userIds", userIds);
                payload.put("type", "NEWSLETTER_BROADCAST");
                payload.put("title", "New Newsletter");
                payload.put("message", subject);
                payload.put("referenceId", campaign.getId());
                payload.put("relatedType", "CAMPAIGN");
                
                notificationServiceClient.sendBulkNotification(payload);
            }
        } catch (Exception e) {
            log.warn("Failed to send in-app notifications for broadcast: {}", e.getMessage());
        }
    }

    public void notifyNewPost(String authorName, String postTitle, Long postId, String postSlug) {
        List<Subscriber> activeSubscribers = subscriberRepository.findByStatus(Subscriber.SubscriberStatus.ACTIVE);
        log.info("Dispatching new post notification for '{}' to {} ACTIVE subscribers", postTitle, activeSubscribers.size());
        
        if (activeSubscribers.isEmpty()) return;

        List<String> emails = activeSubscribers.stream().map(Subscriber::getEmail).collect(Collectors.toList());
        for (String email : emails) {
            log.info("Sending new post notification to email: {}", email);
        }

        try {
            List<Map<String, Object>> users = authServiceClient.findByEmails(emails);
            if (users != null && !users.isEmpty()) {
                List<Long> userIds = users.stream()
                        .map(u -> ((Number) u.get("id")).longValue())
                        .collect(Collectors.toList());
                
                Map<String, Object> payload = new HashMap<>();
                payload.put("userIds", userIds);
                payload.put("type", "NEW_POST");
                payload.put("title", "New Post Alert");
                payload.put("message", authorName + " published a new post: " + postTitle);
                payload.put("referenceId", postId);
                payload.put("relatedSlug", postSlug);
                payload.put("relatedType", "POST");
                
                notificationServiceClient.sendBulkNotification(payload);
            }
        } catch (Exception e) {
            log.warn("Failed to send in-app notifications for new post: {}", e.getMessage());
        }
    }
    
    public List<Campaign> getAllCampaigns() {
        return campaignRepository.findAll();
    }
    
    public void updateCampaign(Long id, String subject, String content) {
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campaign not found"));
        campaign.setSubject(subject);
        campaign.setContent(content);
        campaignRepository.save(campaign);
    }
    
    public void deleteCampaign(Long id) {
        campaignRepository.deleteById(id);
    }
}
