package com.digitalcomp.service.impl;

import com.digitalcomp.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

/**
 * Log-based notification service — simulates notifications via console logging.
 * Active by default when email is not configured.
 */
@Service
@ConditionalOnProperty(name = "spring.mail.username", havingValue = "", matchIfMissing = true)
public class LogNotificationService implements NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(LogNotificationService.class);

    @Override
    public void sendNotification(String to, String subject, String body) {
        logger.info("╔══════════════════════════════════════════════════════════════");
        logger.info("║ 📧 NOTIFICATION");
        logger.info("║ To:      {}", to != null ? to : "ALL ADMINS");
        logger.info("║ Subject: {}", subject);
        logger.info("║ Body:    {}", body);
        logger.info("╚══════════════════════════════════════════════════════════════");
    }
}
