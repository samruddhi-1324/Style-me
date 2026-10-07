package com.styleme.order.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class OrderItemResponse {
    private Long id;
    private String productId;
    private UUID variantId;
    private String productName;
    private String variantName;
    private String sku;
    private BigDecimal unitPrice;
    private int quantity;
    private BigDecimal lineTotal;
}
