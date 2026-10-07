package com.styleme.cart.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class AddToCartRequest {
    @NotBlank(message = "Product ID is required")
    private String productId;
    
    private UUID variantId;
    
    @Min(value = 1, message = "Quantity must be at least 1")
    private int quantity = 1;
}
