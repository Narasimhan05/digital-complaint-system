package com.digitalcomp.service;

/**
 * Notification service interface — supports both simulated (log) and real (email) implementations.
 */
public interface NotificationService {

    /**
     * Send a notification.
     *
     * @param to      recipient email (null = broadcast to admins)
     * @param subject notification subject
     * @param body    notification body
     */
    void sendNotification(String to, String subject, String body);
}
