package com.digitalcomp.service;

import com.digitalcomp.dto.request.ComplaintRequest;
import com.digitalcomp.dto.response.ComplaintHistoryResponse;
import com.digitalcomp.dto.response.ComplaintResponse;
import com.digitalcomp.entity.Complaint;
import com.digitalcomp.entity.ComplaintHistory;
import com.digitalcomp.entity.User;
import com.digitalcomp.enums.ComplaintStatus;
import com.digitalcomp.exception.ResourceNotFoundException;
import com.digitalcomp.repository.ComplaintHistoryRepository;
import com.digitalcomp.repository.ComplaintRepository;
import com.digitalcomp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ComplaintService {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private ComplaintHistoryRepository historyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Value("${sla.deadline-hours:48}")
    private int slaDeadlineHours;

    @Transactional
    public ComplaintResponse createComplaint(ComplaintRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Complaint complaint = Complaint.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .priority(request.getPriority())
                .status(ComplaintStatus.RAISED)
                .raisedBy(user)
                .slaDeadline(LocalDateTime.now().plusHours(slaDeadlineHours))
                .escalated(false)
                .build();

        complaint = complaintRepository.save(complaint);

        // Record initial history
        ComplaintHistory history = ComplaintHistory.builder()
                .complaint(complaint)
                .fromStatus(ComplaintStatus.RAISED)
                .toStatus(ComplaintStatus.RAISED)
                .comment("Complaint raised")
                .changedBy(user)
                .build();
        historyRepository.save(history);

        // Notify
        notificationService.sendNotification(
                null, // notify admins
                "New Complaint Raised: " + complaint.getTitle(),
                "A new complaint has been raised by " + user.getName()
                        + "\nCategory: " + complaint.getCategory()
                        + "\nPriority: " + complaint.getPriority()
                        + "\nSLA Deadline: " + complaint.getSlaDeadline()
        );

        return mapToResponse(complaint);
    }

    public Page<ComplaintResponse> getUserComplaints(String userEmail, ComplaintStatus status, Pageable pageable) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Page<Complaint> complaints;
        if (status != null) {
            complaints = complaintRepository.findByRaisedByIdAndStatusOrderByCreatedAtDesc(
                    user.getId(), status, pageable);
        } else {
            complaints = complaintRepository.findByRaisedByIdOrderByCreatedAtDesc(
                    user.getId(), pageable);
        }

        return complaints.map(this::mapToResponse);
    }

    public ComplaintResponse getComplaintById(Long id) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));
        return mapToResponse(complaint);
    }

    public List<ComplaintHistoryResponse> getComplaintHistory(Long complaintId) {
        // Verify complaint exists
        if (!complaintRepository.existsById(complaintId)) {
            throw new ResourceNotFoundException("Complaint not found with id: " + complaintId);
        }

        List<ComplaintHistory> history = historyRepository
                .findByComplaintIdOrderByChangedAtDesc(complaintId);

        return history.stream()
                .map(this::mapToHistoryResponse)
                .collect(Collectors.toList());
    }

    // ========== Mapper Methods ==========

    public ComplaintResponse mapToResponse(Complaint complaint) {
        ComplaintResponse.ComplaintResponseBuilder builder = ComplaintResponse.builder()
                .id(complaint.getId())
                .title(complaint.getTitle())
                .description(complaint.getDescription())
                .category(complaint.getCategory())
                .priority(complaint.getPriority())
                .status(complaint.getStatus())
                .escalated(complaint.getEscalated())
                .raisedById(complaint.getRaisedBy().getId())
                .raisedByName(complaint.getRaisedBy().getName())
                .raisedByEmail(complaint.getRaisedBy().getEmail())
                .slaDeadline(complaint.getSlaDeadline())
                .resolvedAt(complaint.getResolvedAt())
                .createdAt(complaint.getCreatedAt())
                .updatedAt(complaint.getUpdatedAt())
                .slaBreach(complaint.getSlaDeadline() != null
                        && LocalDateTime.now().isAfter(complaint.getSlaDeadline())
                        && complaint.getStatus() != ComplaintStatus.RESOLVED
                        && complaint.getStatus() != ComplaintStatus.CLOSED);

        if (complaint.getAssignedTo() != null) {
            builder.assignedToId(complaint.getAssignedTo().getId())
                    .assignedToName(complaint.getAssignedTo().getName())
                    .assignedToEmail(complaint.getAssignedTo().getEmail());
        }

        return builder.build();
    }

    private ComplaintHistoryResponse mapToHistoryResponse(ComplaintHistory history) {
        return ComplaintHistoryResponse.builder()
                .id(history.getId())
                .fromStatus(history.getFromStatus())
                .toStatus(history.getToStatus())
                .comment(history.getComment())
                .changedByName(history.getChangedBy() != null ? history.getChangedBy().getName() : "System")
                .changedAt(history.getChangedAt())
                .build();
    }
}
