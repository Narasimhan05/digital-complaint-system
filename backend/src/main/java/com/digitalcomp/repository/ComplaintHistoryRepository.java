package com.digitalcomp.repository;

import com.digitalcomp.entity.ComplaintHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintHistoryRepository extends JpaRepository<ComplaintHistory, Long> {

    List<ComplaintHistory> findByComplaintIdOrderByChangedAtDesc(Long complaintId);
}
