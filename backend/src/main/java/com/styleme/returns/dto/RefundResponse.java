package com.styleme.returns.dto;

import com.styleme.returns.entity.RefundStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record RefundResponse(
        String id,
        String returnRequestId,
        String orderId,
        UUID customerId,
        BigDecimal amount,
        RefundStatus status,
        String paymentProvider,
        String paymentReference,
        Instant initiatedAt,
        Instant processedAt,
        String notes
) {}
