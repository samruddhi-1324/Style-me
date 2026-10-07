package com.styleme.user.controller;

import com.styleme.admin.dto.AdminAuditLogResponse;
import com.styleme.admin.service.AdminDashboardService;
import com.styleme.common.dto.ApiResponse;
import com.styleme.user.dto.UserResponse;
import com.styleme.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@Tag(name = "Administration", description = "Privileged administrator operations and RBAC verification")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final UserService userService;
    private final AdminDashboardService adminDashboardService;

    public AdminController(UserService userService, AdminDashboardService adminDashboardService) {
        this.userService = userService;
        this.adminDashboardService = adminDashboardService;
    }

    @GetMapping("/users")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Get all registered users (Admin only)", description = "Returns full list of registered accounts. Restricted to administrators.")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<UserResponse> users = userService.getAllUsers();
        adminDashboardService.recordAudit("VIEW_USERS", "USER", "collection", "ADMIN", "SUCCESS", "Admin user directory accessed");
        return ResponseEntity.ok(ApiResponse.success("User list retrieved successfully", users));
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Admin dashboard status metrics", description = "Returns admin operational metrics. Restricted to administrators.")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        Map<String, Object> stats = adminDashboardService.getDashboard();
        adminDashboardService.recordAudit("VIEW_DASHBOARD", "ADMIN_DASHBOARD", "dashboard", "ADMIN", "SUCCESS", "Admin dashboard accessed");
        return ResponseEntity.ok(ApiResponse.success("Admin dashboard retrieved successfully", stats));
    }

    @GetMapping("/audit-logs")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Admin audit log stream", description = "Returns recent administrative actions for audit and compliance review.")
    public ResponseEntity<ApiResponse<Page<AdminAuditLogResponse>>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<AdminAuditLogResponse> logs = adminDashboardService.getAuditLogs(page, size);
        adminDashboardService.recordAudit("VIEW_AUDIT_LOGS", "ADMIN_AUDIT_LOG", "collection", "ADMIN", "SUCCESS", "Audit log list retrieved");
        return ResponseEntity.ok(ApiResponse.success("Audit logs retrieved successfully", logs));
    }
}
