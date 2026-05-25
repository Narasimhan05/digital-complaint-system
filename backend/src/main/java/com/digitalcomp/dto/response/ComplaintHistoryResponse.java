package com.digitalcomp.dto.response;

import com.digitalcomp.enums.ComplaintStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintHistoryResponse {
    private Long id;
    private ComplaintStatus fromStatus;
    private ComplaintStatus toStatus;
    private String comment;
    private String changedByName;
    private LocalDateTime changedAt;
}
