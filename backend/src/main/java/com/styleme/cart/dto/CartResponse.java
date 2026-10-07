package com.styleme.cart.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class CartResponse {
    private UUID id;
    private UUID customerId;
    private String sessionId;
    private List<CartItemResponse> items;
    private BigDecimal subtotal; // Derived field
}
