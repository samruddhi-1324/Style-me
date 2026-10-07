package com.styleme.returns.dto;

import java.math.BigDecimal;

public record ReturnItemResponse(
        String id,
        Long orderItemId,
        String productId,
        String productName,
        String variantName,
        String sku,
        int quantity,
        BigDecimal unitPrice,
        BigDecimal lineTotal
) {}
