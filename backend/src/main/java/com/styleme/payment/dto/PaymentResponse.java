package com.styleme.payment.dto;

import com.styleme.payment.entity.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class PaymentResponse {
    private String id;
    private String orderId;
    private UUID customerId;
    private BigDecimal amount;
    private String currency;
    private PaymentStatus status;
    private String provider;
    private String providerTransactionId;
    private String paymentMethod;
    private String errorMessage;
    private Instant createdAt;
    private Instant updatedAt;
}
