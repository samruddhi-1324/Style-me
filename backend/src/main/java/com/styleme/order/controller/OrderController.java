package com.styleme.order.controller;

import com.styleme.auth.security.UserPrincipal;
import com.styleme.common.dto.ApiResponse;
import com.styleme.order.dto.CheckoutRequest;
import com.styleme.order.dto.OrderResponse;
import com.styleme.order.entity.OrderStatus;
import com.styleme.order.service.OrderService;
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
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // =========================================================================
    // CUSTOMER ENDPOINTS
    // =========================================================================

    @PostMapping("/orders/checkout")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<OrderResponse>> checkout(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CheckoutRequest req) {
        UUID customerId = principal.getId();
        OrderResponse response = orderService.checkout(customerId, req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Order placed successfully", response));
    }

    @GetMapping("/orders/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id) {
        UUID customerId = principal.getId();
        return ResponseEntity.ok(ApiResponse.success("Order retrieved", orderService.getOrder(id, customerId)));
    }

    @GetMapping("/orders")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getMyOrders(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        UUID customerId = principal.getId();
        return ResponseEntity.ok(ApiResponse.success(
                "Orders retrieved", 
                orderService.getCustomerOrders(customerId, PageRequest.of(page, size))
        ));
    }

    // =========================================================================
    // ADMIN ENDPOINTS
    // =========================================================================

    @GetMapping("/admin/orders/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderAdmin(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success("Order retrieved", orderService.getOrderAdmin(id)));
    }

    @PatchMapping("/admin/orders/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id,
            @RequestParam OrderStatus status,
            @RequestParam(required = false) String notes) {
        String adminEmail = principal.getUsername();
        return ResponseEntity.ok(ApiResponse.success(
                "Order status updated", 
                orderService.updateOrderStatus(id, status, adminEmail, notes)
        ));
    }
}
