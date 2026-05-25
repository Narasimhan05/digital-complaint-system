package com.digitalcomp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStats {
    private long totalComplaints;
    private long raisedCount;
    private long inProgressCount;
    private long escalatedCount;
    private long resolvedCount;
    private long closedCount;
    private long slaBreachCount;
    private long totalUsers;
}
