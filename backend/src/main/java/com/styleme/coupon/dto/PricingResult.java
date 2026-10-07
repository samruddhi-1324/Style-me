package com.styleme.coupon.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Authoritative price breakdown for a cart or order.
 * SRS Section 100: Backend must calculate or verify every pricing component.
 * Frontend may display an estimated total but must never submit or trust its own calculation.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PricingResult {

    /** Sum of (variant price * quantity) for all cart items. */
    private BigDecimal subtotal;

    /** Coupon discount applied (0 if no coupon). */
    private BigDecimal discountAmount;

    /** Coupon code applied, or null. */
    private String appliedCouponCode;

    /** Tax amount (calculated at backend rate). */
    private BigDecimal taxAmount;

    /** Tax rate applied (e.g., 0.18 for 18%). */
    private BigDecimal taxRate;

    /** Shipping charge (flat or calculated). */
    private BigDecimal shippingAmount;

    /**
     * Authoritative grand total.
     * grandTotal = subtotal - discountAmount + taxAmount + shippingAmount
     */
    private BigDecimal grandTotal;
}
