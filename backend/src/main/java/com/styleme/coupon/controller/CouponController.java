package com.styleme.coupon.controller;

import com.styleme.auth.security.UserPrincipal;
import com.styleme.common.dto.ApiResponse;
import com.styleme.coupon.dto.*;
import com.styleme.coupon.service.CouponService;
import com.styleme.coupon.service.PricingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;
    private final PricingService pricingService;

    // -----------------------------------------------------------------------
    // Admin: Coupon Management
    // -----------------------------------------------------------------------

    @PostMapping("/admin/coupons")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CouponResponse>> createCoupon(
            @Valid @RequestBody CreateCouponRequest req) {
        CouponResponse response = couponService.createCoupon(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Coupon created successfully", response));
    }

    @GetMapping("/admin/coupons")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<CouponResponse>>> getAllCoupons() {
        return ResponseEntity.ok(ApiResponse.success(couponService.getAllCoupons()));
    }

    @GetMapping("/admin/coupons/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CouponResponse>> getCoupon(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(couponService.getCoupon(id)));
    }

    @PutMapping("/admin/coupons/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CouponResponse>> updateCoupon(
            @PathVariable Long id,
            @Valid @RequestBody CreateCouponRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Coupon updated", couponService.updateCoupon(id, req)));
    }

    @PatchMapping("/admin/coupons/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deactivateCoupon(@PathVariable Long id) {
        couponService.deactivateCoupon(id);
        return ResponseEntity.ok(ApiResponse.<Void>success("Coupon deactivated", null));
    }

    @DeleteMapping("/admin/coupons/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok(ApiResponse.<Void>success("Coupon deleted", null));
    }

    // -----------------------------------------------------------------------
    // Customer: Coupon Validation
    // SRS Section 101 — backend validates all rules; result is authoritative
    // -----------------------------------------------------------------------

    /**
     * Validates a coupon code against the customer's current cart.
     * Returns the authoritative discount amount.
     * Does NOT record redemption (that happens at checkout — Phase 7).
     */
    @PostMapping("/coupons/validate")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<CouponValidationResponse>> validateCoupon(
            @Valid @RequestBody CouponValidationRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        CouponValidationResponse result = couponService.validateCoupon(req, principal.getId());
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    // -----------------------------------------------------------------------
    // Customer: Pricing Summary
    // SRS Section 100 — backend-authoritative price breakdown
    // -----------------------------------------------------------------------

    /**
     * Returns the authoritative price breakdown for the current customer's cart.
     * Optionally applies a coupon code.
     */
    @GetMapping("/cart/pricing")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PricingResult>> getCartPricing(
            @RequestParam(required = false) String couponCode,
            @AuthenticationPrincipal UserPrincipal principal) {
        PricingResult result = pricingService.calculateForCart(principal.getId(), couponCode);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * Returns pricing breakdown for a guest cart by session ID.
     * SRS Section 100: backend must calculate authoritative amounts.
     */
    @GetMapping("/cart/pricing/guest")
    public ResponseEntity<ApiResponse<PricingResult>> getGuestCartPricing(
            @RequestHeader(value = "X-Session-ID") String sessionId,
            @RequestParam(required = false) String couponCode) {
        PricingResult result = pricingService.calculateForSession(sessionId, couponCode);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
