package com.styleme.inventory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CreateInventoryRequest {

    @NotBlank(message = "Product ID is required")
    private String productId;

    private UUID variantId;

    @NotBlank(message = "SKU is required")
    private String sku;

    @Min(value = 0, message = "Initial quantity cannot be negative")
    private int quantity = 0;

    @Min(value = 0, message = "Low stock threshold cannot be negative")
    private int lowStockThreshold = 5;
}
