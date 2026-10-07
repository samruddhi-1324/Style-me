package com.styleme.returns.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateReturnRequest(
        @NotBlank(message = "Order ID is required")
        String orderId,

        @NotBlank(message = "Return reason is required")
        @Size(max = 255, message = "Reason must not exceed 255 characters")
        String reason,

        String notes,

        @NotEmpty(message = "At least one item must be selected for return")
        @Valid
        List<ReturnItemRequest> items
) {}
