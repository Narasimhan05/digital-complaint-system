package com.digitalcomp.controller;

import com.digitalcomp.dto.request.AssignRequest;
import com.digitalcomp.dto.request.StatusUpdateRequest;
import com.digitalcomp.dto.response.ApiResponse;
import com.digitalcomp.dto.response.ComplaintResponse;
import com.digitalcomp.dto.response.DashboardStats;
import com.digitalcomp.dto.response.UserResponse;
import com.digitalcomp.enums.ComplaintStatus;
import com.digitalcomp.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin", description = "Admin complaint management operations")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/complaints")
    @Operation(summary = "Get all complaints (paginated, filterable)")
    public ResponseEntity<ApiResponse<Page<ComplaintResponse>>> getAllComplaints(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) ComplaintStatus status) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ComplaintResponse> complaints = adminService.getAllComplaints(status, pageable);
        return ResponseEntity.ok(ApiResponse.success(complaints));
    }

    @PutMapping("/complaints/{id}/assign")
    @Operation(summary = "Assign complaint to a user")
    public ResponseEntity<ApiResponse<ComplaintResponse>> assignComplaint(
            @PathVariable Long id,
            @Valid @RequestBody AssignRequest request,
            Authentication authentication) {
        ComplaintResponse response = adminService.assignComplaint(
                id, request, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Complaint assigned successfully", response));
    }

    @PutMapping("/complaints/{id}/status")
    @Operation(summary = "Update complaint status")
    public ResponseEntity<ApiResponse<ComplaintResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request,
            Authentication authentication) {
        ComplaintResponse response = adminService.updateComplaintStatus(
                id, request, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Status updated successfully", response));
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get dashboard statistics")
    public ResponseEntity<ApiResponse<DashboardStats>> getDashboardStats() {
        DashboardStats stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/users")
    @Operation(summary = "Get all users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<UserResponse> users = adminService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success(users));
    }
}
