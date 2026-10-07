package com.styleme.coupon.dto;

import com.styleme.coupon.entity.DiscountType;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
public class CreateCouponRequest {

    @NotBlank(message = "Coupon code is required")
    @Size(min = 3, max = 50, message = "Code must be between 3 and 50 characters")
    private String code;

    private String description;

    @NotNull(message = "Discount type is required")
    private DiscountType discountType;

    @NotNull(message = "Discount value is required")
    @DecimalMin(value = "0.01", message = "Discount value must be positive")
    private BigDecimal discountValue;

    /** Cap for PERCENTAGE discounts. Null = no cap. */
    @DecimalMin(value = "0.01", message = "Max discount amount must be positive")
    private BigDecimal maxDiscountAmount;

    @DecimalMin(value = "0.00", inclusive = true, message = "Min order value cannot be negative")
    private BigDecimal minOrderValue = BigDecimal.ZERO;

    /** Null = unlimited */
    @Min(value = 1, message = "Max uses must be at least 1")
    private Integer maxUses;

    @Min(value = 1, message = "Max uses per user must be at least 1")
    private int maxUsesPerUser = 1;

    @NotNull(message = "Valid-from date is required")
    private Instant validFrom;

    /** Null = no expiry */
    private Instant validUntil;

    /** Optional: product IDs to restrict the coupon to */
    private List<String> productIds;

    /** Optional: category IDs to restrict the coupon to */
    private List<Long> categoryIds;
}
