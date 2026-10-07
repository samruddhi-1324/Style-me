package com.styleme.review.dto;

import java.math.BigDecimal;

public record ReviewSummaryResponse(
        String productId,
        BigDecimal averageRating,
        long totalReviews,
        long fiveStar,
        long fourStar,
        long threeStar,
        long twoStar,
        long oneStar
) {}
