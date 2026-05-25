package com.digitalcomp.service.impl;

import com.digitalcomp.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Email-based notification service — sends real emails via SMTP.
 * Active only when spring.mail.username is configured.
 */
@Service
@ConditionalOnProperty(name = "spring.mail.username", matchIfMissing = false)
public class EmailNotificationService implements NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(EmailNotificationService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Override
    public void sendNotification(String to, String subject, String body) {
        try {
            if (to == null || to.isBlank()) {
                logger.info("Broadcast notification (no specific recipient): {}", subject);
                return;
            }

            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("[Digital Complaint System] " + subject);
            message.setText(body);

            mailSender.send(message);
            logger.info("Email sent successfully to: {}", to);
        } catch (Exception e) {
            logger.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}
