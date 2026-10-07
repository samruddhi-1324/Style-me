package com.styleme.returns.controller;

import com.styleme.auth.security.UserPrincipal;
import com.styleme.common.dto.ApiResponse;
import com.styleme.returns.dto.CreateReturnRequest;
import com.styleme.returns.dto.ReturnDecisionRequest;
import com.styleme.returns.dto.ReturnRequestResponse;
import com.styleme.returns.service.ReturnService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1")
public class ReturnController {

    private final ReturnService returnService;

    @PostMapping("/returns")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<ReturnRequestResponse>> createReturn(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateReturnRequest request) {
        ReturnRequestResponse response = returnService.createReturn(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Return request created successfully", response));
    }

    @GetMapping("/returns")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<Page<ReturnRequestResponse>>> getMyReturns(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                "Return requests retrieved",
                returnService.getCustomerReturns(principal.getId(), PageRequest.of(page, size))
        ));
    }

    @GetMapping("/returns/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<ReturnRequestResponse>> getReturn(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(
                "Return request retrieved",
                returnService.getReturn(id, principal.getId())
        ));
    }

    @GetMapping("/admin/returns")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Page<ReturnRequestResponse>>> getAllReturns(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                "Return requests retrieved",
                returnService.getAllReturns(PageRequest.of(page, size))
        ));
    }

    @PatchMapping("/admin/returns/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<ReturnRequestResponse>> approveReturn(
            @PathVariable String id,
            @Valid @RequestBody ReturnDecisionRequest decision) {
        return ResponseEntity.ok(ApiResponse.success(
                "Return request approved",
                returnService.approveReturn(id, decision)
        ));
    }

    @PatchMapping("/admin/returns/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<ReturnRequestResponse>> rejectReturn(
            @PathVariable String id,
            @RequestBody(required = false) ReturnDecisionRequest decision) {
        return ResponseEntity.ok(ApiResponse.success(
                "Return request rejected",
                returnService.rejectReturn(id, decision)
        ));
    }

    @PatchMapping("/admin/returns/{id}/complete")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<ReturnRequestResponse>> completeReturn(
            @PathVariable String id,
            @RequestBody(required = false) ReturnDecisionRequest decision) {
        return ResponseEntity.ok(ApiResponse.success(
                "Return request completed",
                returnService.completeReturn(id, decision)
        ));
    }
}
