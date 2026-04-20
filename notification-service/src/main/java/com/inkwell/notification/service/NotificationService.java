package com.inkwell.notification.service;

import com.inkwell.notification.entity.Notification;
import com.inkwell.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public void processNotification(Map<String, Object> payload) {
        Long recipientId = ((Number) payload.get("recipientId")).longValue();
        Long actorId = payload.get("actorId") != null ? ((Number) payload.get("actorId")).longValue() : null;
        String type = (String) payload.get("type");
        String title = (String) payload.get("title");
        String message = (String) payload.get("message");
        Long relatedId = payload.get("relatedId") != null ? ((Number) payload.get("relatedId")).longValue() : null;
        String relatedSlug = (String) payload.get("relatedSlug");
        String relatedType = (String) payload.get("relatedType");

        Notification notification = Notification.builder()
                .recipientId(recipientId)
                .actorId(actorId)
                .type(type)
                .title(title)
                .message(message)
                .relatedId(relatedId)
                .relatedSlug(relatedSlug)
                .relatedType(relatedType)
                .read(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        
        // Push to websocket
        messagingTemplate.convertAndSendToUser(
                recipientId.toString(),
                "/queue/notifications",
                saved
        );

        // Optional email dispatch
        if (payload.get("sendEmail") != null && (Boolean) payload.get("sendEmail")) {
            sendEmail(recipientId, title, message);
        }
    }

    public void sendBulk(List<Long> recipientIds, String type, String title, String message, Long relatedId, String relatedSlug, String relatedType) {
        for (Long recipientId : recipientIds) {
            Notification notification = Notification.builder()
                    .recipientId(recipientId)
                    .type(type)
                    .title(title)
                    .message(message)
                    .relatedId(relatedId)
                    .relatedSlug(relatedSlug)
                    .relatedType(relatedType)
                    .read(false)
                    .build();
            Notification saved = notificationRepository.save(notification);
            
            messagingTemplate.convertAndSendToUser(
                    recipientId.toString(),
                    "/queue/notifications",
                    saved
            );
        }
    }

    @Transactional(readOnly = true)
    public List<Notification> getByRecipient(Long recipientId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(recipientId);
    }

    public void markAsRead(Long notificationId, Long recipientId) {
        Notification notification = notificationRepository.findById(notificationId).orElseThrow();
        if (notification.getRecipientId().equals(recipientId)) {
            notification.setRead(true);
            notificationRepository.save(notification);
        }
    }

    public void markAllRead(Long recipientId) {
        List<Notification> unread = notificationRepository.findByRecipientIdAndReadFalse(recipientId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    public void deleteRead(Long recipientId) {
        notificationRepository.deleteByRecipientIdAndReadTrue(recipientId);
    }

    public void deleteNotification(Long notificationId, Long recipientId) {
        Notification notification = notificationRepository.findById(notificationId).orElseThrow();
        if (notification.getRecipientId().equals(recipientId)) {
            notificationRepository.delete(notification);
        }
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long recipientId) {
        return notificationRepository.countByRecipientIdAndReadFalse(recipientId);
    }

    public void sendEmail(Long recipientId, String title, String message) {
        log.info("Sending transactional email to user {}: [{}] {}", recipientId, title, message);
        // Integrate with MailSender here if configured
    }
    
    public List<Notification> getAll() {
        return notificationRepository.findAll();
    }
}
