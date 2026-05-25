package com.digitalcomp.dto.request;

import com.digitalcomp.enums.ComplaintStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatusUpdateRequest {

    @NotNull(message = "Status is required")
    private ComplaintStatus status;

    private String comment;
}
