package com.inkwell.notification.repository;

import com.inkwell.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);
    long countByRecipientIdAndReadFalse(Long recipientId);
    List<Notification> findByRecipientIdAndReadFalse(Long recipientId);
    void deleteByRecipientIdAndReadTrue(Long recipientId);
    
    // Spec requirements
    java.util.List<Notification> findByType(String type);
    java.util.List<Notification> findByRelatedId(Long relatedId);
}
