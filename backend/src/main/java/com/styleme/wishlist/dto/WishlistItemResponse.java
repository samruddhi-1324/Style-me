package com.styleme.wishlist.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Builder
public class WishlistItemResponse {
    private Long id;
    private String productId;
    private String name;
    private String sku;
    private String imageUrl;
    private BigDecimal price;
    private boolean inStock;
    private Instant addedAt;
}
