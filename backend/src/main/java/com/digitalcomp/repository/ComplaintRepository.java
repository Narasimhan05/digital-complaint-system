package com.digitalcomp.repository;

import com.digitalcomp.entity.Complaint;
import com.digitalcomp.enums.ComplaintStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    // User queries
    Page<Complaint> findByRaisedByIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Page<Complaint> findByRaisedByIdAndStatusOrderByCreatedAtDesc(Long userId, ComplaintStatus status, Pageable pageable);

    // Admin queries
    Page<Complaint> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<Complaint> findByStatusOrderByCreatedAtDesc(ComplaintStatus status, Pageable pageable);

    Page<Complaint> findByAssignedToIdOrderByCreatedAtDesc(Long assigneeId, Pageable pageable);

    // SLA breach query — finds complaints past their deadline that haven't been resolved/closed/escalated
    @Query("SELECT c FROM Complaint c WHERE c.status NOT IN :excludedStatuses AND c.slaDeadline < :now")
    List<Complaint> findBreachedComplaints(
            @Param("excludedStatuses") List<ComplaintStatus> excludedStatuses,
            @Param("now") LocalDateTime now
    );

    // Dashboard statistics
    long countByStatus(ComplaintStatus status);

    long countByEscalated(Boolean escalated);

    long countByRaisedById(Long userId);

    long countByAssignedToId(Long assigneeId);

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.slaDeadline < :now AND c.status NOT IN :resolvedStatuses")
    long countSlaBreaches(
            @Param("now") LocalDateTime now,
            @Param("resolvedStatuses") List<ComplaintStatus> resolvedStatuses
    );
}
