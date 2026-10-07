package com.styleme.inventory.dto;

import lombok.Builder;
import lombok.Getter;
import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class InventoryResponse {

    private Long id;
    private String productId;
    private UUID variantId;
    private String sku;
    private int quantity;
    private int reserved;
    private int available;
    private int lowStockThreshold;
    private boolean inStock;
    private boolean lowStock;
    private boolean outOfStock;
    private Long version;
    private Instant createdAt;
    private Instant updatedAt;
}
