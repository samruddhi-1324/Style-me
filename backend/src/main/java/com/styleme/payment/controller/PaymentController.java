package com.styleme.payment.controller;

import com.styleme.auth.security.UserPrincipal;
import com.styleme.common.dto.ApiResponse;
import com.styleme.payment.dto.PaymentInitiateRequest;
import com.styleme.payment.dto.PaymentResponse;
import com.styleme.payment.dto.PaymentVerificationRequest;
import com.styleme.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/initiate")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<PaymentResponse>> initiatePayment(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PaymentInitiateRequest req) {
        UUID customerId = principal.getId();
        return ResponseEntity.ok(ApiResponse.success(
                "Payment initiated", 
                paymentService.initiatePayment(customerId, req)
        ));
    }

    @PostMapping("/{id}/verify")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<PaymentResponse>> verifyPayment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id,
            @Valid @RequestBody PaymentVerificationRequest req) {
        UUID customerId = principal.getId();
        return ResponseEntity.ok(ApiResponse.success(
                "Payment verification processed", 
                paymentService.verifyPayment(id, customerId, req)
        ));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPayment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id) {
        UUID customerId = principal.getId();
        return ResponseEntity.ok(ApiResponse.success(
                "Payment retrieved", 
                paymentService.getPayment(id, customerId)
        ));
    }
}
