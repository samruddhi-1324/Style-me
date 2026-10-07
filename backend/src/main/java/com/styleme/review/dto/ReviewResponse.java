package com.styleme.review.dto;

import com.styleme.review.entity.ReviewStatus;

import java.time.Instant;
import java.util.UUID;

public record ReviewResponse(
        UUID id,
        String productId,
        UUID customerId,
        String customerName,
        String orderId,
        int rating,
        String title,
        String comment,
        boolean verifiedPurchase,
        ReviewStatus status,
        String moderationNote,
        Instant createdAt,
        Instant updatedAt
) {}
