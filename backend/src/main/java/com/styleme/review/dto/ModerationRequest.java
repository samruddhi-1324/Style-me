package com.styleme.review.dto;

import com.styleme.review.entity.ReviewStatus;
import jakarta.validation.constraints.NotNull;

public record ModerationRequest(
        @NotNull(message = "Review status is required")
        ReviewStatus status,
        String moderationNote
) {}
