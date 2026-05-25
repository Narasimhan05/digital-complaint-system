package com.digitalcomp.scheduler;

import com.digitalcomp.entity.Complaint;
import com.digitalcomp.entity.ComplaintHistory;
import com.digitalcomp.enums.ComplaintStatus;
import com.digitalcomp.repository.ComplaintHistoryRepository;
import com.digitalcomp.repository.ComplaintRepository;
import com.digitalcomp.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

/**
 * Scheduled job that automatically escalates complaints that have breached their SLA deadline.
 * Runs every 30 minutes (configurable via sla.check-interval-ms).
 */
@Component
public class SlaEscalationJob {

    private static final Logger logger = LoggerFactory.getLogger(SlaEscalationJob.class);

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private ComplaintHistoryRepository historyRepository;

    @Autowired
    private NotificationService notificationService;

    @Scheduled(fixedDelayString = "${sla.check-interval-ms:1800000}")
    @Transactional
    public void escalateBreachedComplaints() {
        logger.info("🔄 Running SLA escalation check at {}", LocalDateTime.now());

        List<ComplaintStatus> excludedStatuses = Arrays.asList(
                ComplaintStatus.RESOLVED,
                ComplaintStatus.CLOSED,
                ComplaintStatus.ESCALATED
        );

        List<Complaint> breachedComplaints = complaintRepository
                .findBreachedComplaints(excludedStatuses, LocalDateTime.now());

        if (breachedComplaints.isEmpty()) {
            logger.info("✅ No SLA breaches found");
            return;
        }

        logger.warn("⚠️ Found {} complaints with SLA breaches", breachedComplaints.size());

        for (Complaint complaint : breachedComplaints) {
            ComplaintStatus oldStatus = complaint.getStatus();
            complaint.setStatus(ComplaintStatus.ESCALATED);
            complaint.setEscalated(true);
            complaintRepository.save(complaint);

            // Record history
            ComplaintHistory history = ComplaintHistory.builder()
                    .complaint(complaint)
                    .fromStatus(oldStatus)
                    .toStatus(ComplaintStatus.ESCALATED)
                    .comment("Auto-escalated: SLA deadline breached (deadline was " + complaint.getSlaDeadline() + ")")
                    .build();
            historyRepository.save(history);

            // Notify
            notificationService.sendNotification(
                    null, // broadcast to admins
                    "🚨 SLA BREACH - Complaint #" + complaint.getId(),
                    "Complaint #" + complaint.getId() + " has been auto-escalated due to SLA breach."
                            + "\nTitle: " + complaint.getTitle()
                            + "\nPriority: " + complaint.getPriority()
                            + "\nDeadline was: " + complaint.getSlaDeadline()
                            + "\nRaised by: " + complaint.getRaisedBy().getName()
            );

            logger.warn("🔺 Escalated complaint #{} - '{}'", complaint.getId(), complaint.getTitle());
        }

        logger.info("🔄 SLA escalation check completed. Escalated {} complaints",
                breachedComplaints.size());
    }
}
