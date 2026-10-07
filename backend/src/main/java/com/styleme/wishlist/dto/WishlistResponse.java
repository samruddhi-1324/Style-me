package com.styleme.wishlist.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class WishlistResponse {
    private UUID id;
    private UUID customerId;
    private List<WishlistItemResponse> items;
}
