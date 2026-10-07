package com.styleme.cart.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Builder
public class CartItemResponse {
    private Long id;
    private String productId;
    private UUID variantId;
    private String name;
    private String sku;
    private String imageUrl;
    private BigDecimal price;
    private int quantity;
    private BigDecimal lineTotal;
}
