package com.styleme.review.controller;

import com.styleme.auth.security.UserPrincipal;
import com.styleme.common.dto.ApiResponse;
import com.styleme.review.dto.*;
import com.styleme.review.service.ReviewService;
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
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/reviews")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateReviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Review created successfully",
                        reviewService.createReview(principal.getId(), request)));
    }

    @GetMapping("/reviews/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<Page<ReviewResponse>>> getMyReviews(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                "Your reviews",
                reviewService.getCustomerReviews(principal.getId(), PageRequest.of(page, size))
        ));
    }

    @DeleteMapping("/reviews/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<Void>> deleteMyReview(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        reviewService.deleteMyReview(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Review deleted successfully", null));
    }

    @GetMapping("/products/{productId}/reviews")
    public ResponseEntity<ApiResponse<Page<ReviewResponse>>> getProductReviews(
            @PathVariable String productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                "Product reviews retrieved",
                reviewService.getProductReviews(productId, PageRequest.of(page, size))
        ));
    }

    @GetMapping("/products/{productId}/reviews/summary")
    public ResponseEntity<ApiResponse<ReviewSummaryResponse>> getProductReviewSummary(
            @PathVariable String productId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Product review summary retrieved",
                reviewService.getProductReviewSummary(productId)
        ));
    }

    @GetMapping("/admin/reviews")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Page<ReviewResponse>>> getPendingReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                "Pending reviews retrieved",
                reviewService.getPendingReviews(PageRequest.of(page, size))
        ));
    }

    @PatchMapping("/admin/reviews/{id}/moderate")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<ReviewResponse>> moderateReview(
            @PathVariable UUID id,
            @Valid @RequestBody ModerationRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Review moderated",
                reviewService.moderateReview(id, request)
        ));
    }
}
