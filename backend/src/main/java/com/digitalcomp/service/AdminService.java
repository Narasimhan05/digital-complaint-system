package com.digitalcomp.service;

import com.digitalcomp.dto.request.AssignRequest;
import com.digitalcomp.dto.request.StatusUpdateRequest;
import com.digitalcomp.dto.response.ComplaintResponse;
import com.digitalcomp.dto.response.DashboardStats;
import com.digitalcomp.dto.response.UserResponse;
import com.digitalcomp.entity.Complaint;
import com.digitalcomp.entity.ComplaintHistory;
import com.digitalcomp.entity.User;
import com.digitalcomp.enums.ComplaintStatus;
import com.digitalcomp.exception.BadRequestException;
import com.digitalcomp.exception.ResourceNotFoundException;
import com.digitalcomp.repository.ComplaintHistoryRepository;
import com.digitalcomp.repository.ComplaintRepository;
import com.digitalcomp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private ComplaintHistoryRepository historyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ComplaintService complaintService;

    @Autowired
    private NotificationService notificationService;

    public Page<ComplaintResponse> getAllComplaints(ComplaintStatus status, Pageable pageable) {
        Page<Complaint> complaints;
        if (status != null) {
            complaints = complaintRepository.findByStatusOrderByCreatedAtDesc(status, pageable);
        } else {
            complaints = complaintRepository.findAllByOrderByCreatedAtDesc(pageable);
        }
        return complaints.map(complaintService::mapToResponse);
    }

    @Transactional
    public ComplaintResponse assignComplaint(Long complaintId, AssignRequest request, String adminEmail) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));

        User assignee = userRepository.findById(request.getAssigneeId())
                .orElseThrow(() -> new ResourceNotFoundException("Assignee not found with id: " + request.getAssigneeId()));

        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        ComplaintStatus oldStatus = complaint.getStatus();
        complaint.setAssignedTo(assignee);

        // Auto-move to IN_PROGRESS if currently RAISED
        if (complaint.getStatus() == ComplaintStatus.RAISED) {
            complaint.setStatus(ComplaintStatus.IN_PROGRESS);
        }

        complaint = complaintRepository.save(complaint);

        // Record history
        ComplaintHistory history = ComplaintHistory.builder()
                .complaint(complaint)
                .fromStatus(oldStatus)
                .toStatus(complaint.getStatus())
                .comment("Assigned to " + assignee.getName())
                .changedBy(admin)
                .build();
        historyRepository.save(history);

        // Notify assignee
        notificationService.sendNotification(
                assignee.getEmail(),
                "Complaint Assigned: " + complaint.getTitle(),
                "You have been assigned complaint #" + complaint.getId()
                        + "\nTitle: " + complaint.getTitle()
                        + "\nPriority: " + complaint.getPriority()
                        + "\nSLA Deadline: " + complaint.getSlaDeadline()
        );

        return complaintService.mapToResponse(complaint);
    }

    @Transactional
    public ComplaintResponse updateComplaintStatus(Long complaintId, StatusUpdateRequest request,
                                                    String adminEmail) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));

        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        validateStatusTransition(complaint.getStatus(), request.getStatus());

        ComplaintStatus oldStatus = complaint.getStatus();
        complaint.setStatus(request.getStatus());

        // Set resolved timestamp
        if (request.getStatus() == ComplaintStatus.RESOLVED) {
            complaint.setResolvedAt(LocalDateTime.now());
        }

        complaint = complaintRepository.save(complaint);

        // Record history
        ComplaintHistory history = ComplaintHistory.builder()
                .complaint(complaint)
                .fromStatus(oldStatus)
                .toStatus(request.getStatus())
                .comment(request.getComment() != null ? request.getComment() : "Status updated")
                .changedBy(admin)
                .build();
        historyRepository.save(history);

        // Notify the complaint raiser
        notificationService.sendNotification(
                complaint.getRaisedBy().getEmail(),
                "Complaint Status Updated: " + complaint.getTitle(),
                "Your complaint #" + complaint.getId() + " status has been updated."
                        + "\nFrom: " + oldStatus + " → To: " + request.getStatus()
                        + (request.getComment() != null ? "\nComment: " + request.getComment() : "")
        );

        return complaintService.mapToResponse(complaint);
    }

    public DashboardStats getDashboardStats() {
        List<ComplaintStatus> resolvedStatuses = Arrays.asList(
                ComplaintStatus.RESOLVED, ComplaintStatus.CLOSED);

        return DashboardStats.builder()
                .totalComplaints(complaintRepository.count())
                .raisedCount(complaintRepository.countByStatus(ComplaintStatus.RAISED))
                .inProgressCount(complaintRepository.countByStatus(ComplaintStatus.IN_PROGRESS))
                .escalatedCount(complaintRepository.countByStatus(ComplaintStatus.ESCALATED))
                .resolvedCount(complaintRepository.countByStatus(ComplaintStatus.RESOLVED))
                .closedCount(complaintRepository.countByStatus(ComplaintStatus.CLOSED))
                .slaBreachCount(complaintRepository.countSlaBreaches(LocalDateTime.now(), resolvedStatuses))
                .totalUsers(userRepository.count())
                .build();
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> UserResponse.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .build())
                .collect(Collectors.toList());
    }

    private void validateStatusTransition(ComplaintStatus current, ComplaintStatus target) {
        // Define valid transitions
        boolean valid = switch (current) {
            case RAISED -> target == ComplaintStatus.IN_PROGRESS || target == ComplaintStatus.ESCALATED;
            case IN_PROGRESS -> target == ComplaintStatus.RESOLVED || target == ComplaintStatus.ESCALATED;
            case ESCALATED -> target == ComplaintStatus.IN_PROGRESS || target == ComplaintStatus.RESOLVED;
            case RESOLVED -> target == ComplaintStatus.CLOSED || target == ComplaintStatus.IN_PROGRESS;
            case CLOSED -> false; // Cannot transition from CLOSED
        };

        if (!valid) {
            throw new BadRequestException(
                    "Invalid status transition from " + current + " to " + target);
        }
    }
}
