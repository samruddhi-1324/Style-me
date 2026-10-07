package com.styleme.coupon.dto;

import com.styleme.coupon.entity.DiscountType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Result of backend coupon validation.
 * SRS Section 101: Backend is the single source of truth for discount amounts.
 * Frontend may display this result, but must NOT compute its own discount.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponValidationResponse {

    private boolean valid;
    private String couponCode;
    private DiscountType discountType;

    /** The authoritative discount amount to be deducted from the order total. */
    private BigDecimal discountAmount;

    /** Human-readable message (success description or failure reason). */
    private String message;
}
