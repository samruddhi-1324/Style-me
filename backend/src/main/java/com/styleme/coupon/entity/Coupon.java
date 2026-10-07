package com.styleme.coupon.entity;

import com.styleme.category.entity.Category;
import com.styleme.product.entity.Product;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

/**
 * Coupon entity.
 * SRS Section 28: Coupon codes, percentage/fixed discounts, product/category restrictions,
 * min order value, expiry, usage limits, per-user limits.
 * SRS Section 101: Backend validates all coupon rules — frontend is informational only.
 */
@Entity
@Table(name = "coupons")
@Getter
@Setter
@NoArgsConstructor
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false, length = 20)
    private DiscountType discountType;

    /** Percentage (0–100) or flat fixed amount depending on discountType */
    @Column(name = "discount_value", nullable = false, precision = 10, scale = 2)
    private BigDecimal discountValue;

    /** For PERCENTAGE type: maximum discount cap. Null = no cap. */
    @Column(name = "max_discount_amount", precision = 10, scale = 2)
    private BigDecimal maxDiscountAmount;

    /** Minimum cart subtotal for the coupon to be applicable. */
    @Column(name = "min_order_value", nullable = false, precision = 10, scale = 2)
    private BigDecimal minOrderValue = BigDecimal.ZERO;

    /** Maximum total redemptions across all users. Null = unlimited. */
    @Column(name = "max_uses")
    private Integer maxUses;

    /** Maximum redemptions per individual customer. */
    @Column(name = "max_uses_per_user", nullable = false)
    private int maxUsesPerUser = 1;

    /** Running count of total redemptions (updated on each use). */
    @Column(name = "current_uses", nullable = false)
    private int currentUses = 0;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "valid_from", nullable = false)
    private Instant validFrom;

    /** Null = no expiry. */
    @Column(name = "valid_until")
    private Instant validUntil;

    // --- Product/Category restrictions ---

    /**
     * If non-empty: coupon only applies to these specific products.
     * If empty: coupon applies to all products (subject to category restrictions).
     */
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "coupon_product_restrictions",
            joinColumns = @JoinColumn(name = "coupon_id"),
            inverseJoinColumns = @JoinColumn(name = "product_id")
    )
    private Set<Product> productRestrictions = new HashSet<>();

    /**
     * If non-empty: coupon only applies to products in these categories.
     * If empty: coupon applies to all categories (subject to product restrictions).
     */
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "coupon_category_restrictions",
            joinColumns = @JoinColumn(name = "coupon_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private Set<Category> categoryRestrictions = new HashSet<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
