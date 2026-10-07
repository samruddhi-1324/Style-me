package com.styleme.returns.dto;

import com.styleme.returns.entity.RefundStatus;
import com.styleme.returns.entity.ReturnStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ReturnRequestResponse(
        String id,
        String orderId,
        String orderNumber,
        UUID customerId,
        ReturnStatus status,
        String reason,
        String notes,
        BigDecimal refundAmount,
        RefundStatus refundStatus,
        Instant requestedAt,
        Instant reviewedAt,
        Instant completedAt,
        List<ReturnItemResponse> items
) {}
