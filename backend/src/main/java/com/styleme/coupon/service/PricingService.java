package com.styleme.coupon.service;

import com.styleme.cart.entity.Cart;
import com.styleme.cart.entity.CartItem;
import com.styleme.cart.repository.CartRepository;
import com.styleme.common.exception.ResourceNotFoundException;
import com.styleme.coupon.dto.PricingResult;
import com.styleme.coupon.entity.Coupon;
import com.styleme.coupon.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

/**
 * Backend-authoritative pricing engine.
 * SRS Section 100: The backend must calculate or verify every pricing component.
 * Frontend total is never trusted.
 */
@Service
@RequiredArgsConstructor
public class PricingService {

    private final CartRepository cartRepository;
    private final CouponRepository couponRepository;
    private final CouponService couponService;

    /** Tax rate — configurable via application.yml (default 18% GST). */
    @Value("${styleme.pricing.tax-rate:0.18}")
    private BigDecimal taxRate;

    /** Flat shipping charge; 0 above freeShippingThreshold. */
    @Value("${styleme.pricing.shipping-charge:99.00}")
    private BigDecimal shippingCharge;

    /** Subtotals at or above this value get free shipping. */
    @Value("${styleme.pricing.free-shipping-threshold:999.00}")
    private BigDecimal freeShippingThreshold;

    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------

    /**
     * Calculate the authoritative price breakdown for a customer cart.
     * Optionally apply a coupon code.
     * Called at cart review and at checkout (SRS Sections 100, 102).
     */
    @Transactional(readOnly = true)
    public PricingResult calculateForCart(UUID customerId, String couponCode) {
        Cart cart = cartRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for customer"));
        return calculate(cart, couponCode);
    }

    /**
     * Calculate for a guest session cart.
     */
    @Transactional(readOnly = true)
    public PricingResult calculateForSession(String sessionId, String couponCode) {
        Cart cart = cartRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for session"));
        return calculate(cart, couponCode);
    }

    /**
     * Core calculation — used by checkout validation (Phase 7).
     * Returns a fully populated PricingResult.
     */
    @Transactional(readOnly = true)
    public PricingResult calculate(Cart cart, String couponCode) {
        // 1. Subtotal = sum of (variant price * quantity)
        BigDecimal subtotal = cart.getItems().stream()
                .map(item -> {
                    BigDecimal unitPrice = resolveItemPrice(item);
                    return unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        // 2. Discount
        BigDecimal discountAmount = BigDecimal.ZERO;
        String appliedCode = null;
        if (couponCode != null && !couponCode.isBlank()) {
            Coupon coupon = couponRepository.findByCodeIgnoreCase(couponCode).orElse(null);
            if (coupon != null && coupon.isActive()) {
                discountAmount = couponService.calculateDiscount(coupon, subtotal);
                appliedCode = coupon.getCode();
            }
        }

        // 3. Taxable base (after discount)
        BigDecimal taxableAmount = subtotal.subtract(discountAmount).max(BigDecimal.ZERO);

        // 4. Tax (applied on discounted subtotal)
        BigDecimal taxAmount = taxableAmount
                .multiply(taxRate)
                .setScale(2, RoundingMode.HALF_UP);

        // 5. Shipping (free above threshold)
        BigDecimal shipping = subtotal.compareTo(freeShippingThreshold) >= 0
                ? BigDecimal.ZERO
                : shippingCharge;

        // 6. Grand total
        BigDecimal grandTotal = taxableAmount
                .add(taxAmount)
                .add(shipping)
                .setScale(2, RoundingMode.HALF_UP);

        return PricingResult.builder()
                .subtotal(subtotal)
                .discountAmount(discountAmount)
                .appliedCouponCode(appliedCode)
                .taxRate(taxRate)
                .taxAmount(taxAmount)
                .shippingAmount(shipping)
                .grandTotal(grandTotal)
                .build();
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    /**
     * Resolve authoritative unit price for a cart item.
     * ProductVariant has no own price field — price lives on the parent Product.
     * Uses product.getPrice() as the authoritative unit price.
     */
    private BigDecimal resolveItemPrice(CartItem item) {
        // Variant exists — price is on the parent product
        if (item.getVariant() != null && item.getVariant().getProduct() != null) {
            BigDecimal productPrice = item.getVariant().getProduct().getPrice();
            if (productPrice != null && productPrice.compareTo(BigDecimal.ZERO) > 0) {
                return productPrice;
            }
        }
        // Fallback: use product directly on cart item
        if (item.getProduct() != null && item.getProduct().getPrice() != null) {
            return item.getProduct().getPrice();
        }
        return BigDecimal.ZERO;
    }
}
