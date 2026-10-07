package com.styleme.returns.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ReturnItemRequest(
        @NotNull(message = "Order item ID is required")
        Long orderItemId,

        @NotNull(message = "Return quantity is required")
        @Min(value = 1, message = "Return quantity must be at least 1")
        Integer quantity
) {}
