package com.digitalcomp.dto.response;

import com.digitalcomp.enums.Category;
import com.digitalcomp.enums.ComplaintStatus;
import com.digitalcomp.enums.Priority;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintResponse {
    private Long id;
    private String title;
    private String description;
    private Category category;
    private Priority priority;
    private ComplaintStatus status;
    private Boolean escalated;

    // Raiser info
    private Long raisedById;
    private String raisedByName;
    private String raisedByEmail;

    // Assignee info
    private Long assignedToId;
    private String assignedToName;
    private String assignedToEmail;

    // Timestamps
    private LocalDateTime slaDeadline;
    private LocalDateTime resolvedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Computed
    private boolean slaBreach;
}
