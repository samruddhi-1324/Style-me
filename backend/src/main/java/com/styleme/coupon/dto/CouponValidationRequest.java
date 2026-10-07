package com.styleme.coupon.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * Request sent by a customer to validate/apply a coupon at cart review.
 * SRS Section 101: Backend re-validates every rule; frontend result is informational only.
 */
@Data
public class CouponValidationRequest {

    @NotBlank(message = "Coupon code is required")
    private String couponCode;

    /** Subtotal of eligible cart items (before discount, after product prices). */
    @NotNull(message = "Order subtotal is required")
    private BigDecimal orderSubtotal;

    /** Product IDs in the cart (for product/category restriction checks). */
    private List<String> cartProductIds;
}
