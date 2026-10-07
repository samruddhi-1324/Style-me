package com.styleme.coupon.entity;

/**
 * SRS Section 28: Supported discount types.
 * PERCENTAGE: discount = (subtotal * discountValue / 100), capped by maxDiscountAmount.
 * FIXED:      discount = discountValue flat amount.
 */
public enum DiscountType {
    PERCENTAGE,
    FIXED
}
