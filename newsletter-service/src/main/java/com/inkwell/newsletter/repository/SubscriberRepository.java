package com.inkwell.newsletter.repository;

import com.inkwell.newsletter.entity.Subscriber;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SubscriberRepository extends JpaRepository<Subscriber, Long> {
    Optional<Subscriber> findByEmail(String email);
    Optional<Subscriber> findByToken(String token);
    boolean existsByEmail(String email);
    
    java.util.List<Subscriber> findByStatus(Subscriber.SubscriberStatus status);
}
