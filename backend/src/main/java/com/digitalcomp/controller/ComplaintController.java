package com.digitalcomp.controller;

import com.digitalcomp.dto.request.ComplaintRequest;
import com.digitalcomp.dto.response.ApiResponse;
import com.digitalcomp.dto.response.ComplaintHistoryResponse;
import com.digitalcomp.dto.response.ComplaintResponse;
import com.digitalcomp.enums.ComplaintStatus;
import com.digitalcomp.service.ComplaintService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
@Tag(name = "Complaints", description = "User complaint operations")
@SecurityRequirement(name = "bearerAuth")
public class ComplaintController {

    @Autowired
    private ComplaintService complaintService;

    @PostMapping
    @Operation(summary = "Raise a new complaint")
    public ResponseEntity<ApiResponse<ComplaintResponse>> createComplaint(
            @Valid @RequestBody ComplaintRequest request,
            Authentication authentication) {
        ComplaintResponse response = complaintService.createComplaint(
                request, authentication.getName());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Complaint raised successfully", response));
    }

    @GetMapping
    @Operation(summary = "Get current user's complaints")
    public ResponseEntity<ApiResponse<Page<ComplaintResponse>>> getMyComplaints(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) ComplaintStatus status,
            Authentication authentication) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ComplaintResponse> complaints = complaintService.getUserComplaints(
                authentication.getName(), status, pageable);
        return ResponseEntity.ok(ApiResponse.success(complaints));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get complaint details by ID")
    public ResponseEntity<ApiResponse<ComplaintResponse>> getComplaint(
            @PathVariable Long id) {
        ComplaintResponse response = complaintService.getComplaintById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}/history")
    @Operation(summary = "Get complaint status change history")
    public ResponseEntity<ApiResponse<List<ComplaintHistoryResponse>>> getComplaintHistory(
            @PathVariable Long id) {
        List<ComplaintHistoryResponse> history = complaintService.getComplaintHistory(id);
        return ResponseEntity.ok(ApiResponse.success(history));
    }
}
