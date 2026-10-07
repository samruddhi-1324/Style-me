package com.styleme.payment.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PaymentInitiateRequest {
    @NotBlank(message = "Order ID is required")
    private String orderId;

    @NotBlank(message = "Payment provider is required")
    private String provider;

    private String paymentMethod;
    
    private String idempotencyKey;
}
