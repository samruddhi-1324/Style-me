package com.styleme.payment.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PaymentVerificationRequest {
    @NotBlank(message = "Provider transaction ID is required")
    private String providerTransactionId;

    @NotBlank(message = "Status from provider is required")
    private String providerStatus;

    private String errorMessage;
}
