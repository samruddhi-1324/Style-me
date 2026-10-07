package com.styleme.wishlist.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddToWishlistRequest {
    @NotBlank(message = "Product ID is required")
    private String productId;
}
