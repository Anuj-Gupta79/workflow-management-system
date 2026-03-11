package com.workflow.backend.notification.service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.workflow.backend.notification.entity.Notification;
import com.workflow.backend.notification.entity.Notification.NotificationType;
import com.workflow.backend.notification.repository.NotificationRepository;
import com.workflow.backend.user.entity.User;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    // userId → SseEmitter (one connection per user)
    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();

    // ===== SSE =====

    public SseEmitter subscribe(Long userId) {
        // 30 min timeout
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L);

        emitter.onCompletion(() -> emitters.remove(userId));
        emitter.onTimeout(() -> emitters.remove(userId));
        emitter.onError(e -> emitters.remove(userId));

        emitters.put(userId, emitter);

        // Send unread count immediately on connect
        try {
            long unread = notificationRepository.countByUserIdAndReadFalse(userId);
            emitter.send(SseEmitter.event()
                    .name("unread-count")
                    .data(unread));
        } catch (Exception e) {
            emitters.remove(userId);
        }

        return emitter;
    }

    // ===== CREATE & PUSH =====

    public void createAndPush(User recipient, String message, NotificationType type) {
        Notification notification = Notification.builder()
                .user(recipient)
                .message(message)
                .type(type)
                .read(false)
                .build();

        notificationRepository.save(notification);
        pushToUser(recipient.getId());
    }

    private void pushToUser(Long userId) {
        SseEmitter emitter = emitters.get(userId);
        if (emitter == null)
            return;

        try {
            long unread = notificationRepository.countByUserIdAndReadFalse(userId);
            emitter.send(SseEmitter.event()
                    .name("unread-count")
                    .data(unread));
        } catch (Exception e) {
            emitters.remove(userId);
        }
    }

    // ===== QUERIES =====

    public List<Notification> getNotificationsForUser(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    public Notification markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        notification.setRead(true);
        Notification saved = notificationRepository.save(notification);
        pushToUser(userId);
        return saved;
    }

    public void markAllAsRead(Long userId) {
        notificationRepository.markAllReadByUserId(userId);
        pushToUser(userId);
    }
}