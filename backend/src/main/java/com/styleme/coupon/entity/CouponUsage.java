package com.styleme.coupon.entity;

import com.styleme.customer.entity.Customer;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Audit record of every coupon redemption.
 * SRS Section 101: Usage limits and per-user limits are enforced by counting these records.
 */
@Entity
@Table(name = "coupon_usages")
@Getter
@Setter
@NoArgsConstructor
public class CouponUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "coupon_id", nullable = false)
    private Coupon coupon;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "order_id", length = 100)
    private String orderId;

    @Column(name = "discount_applied", nullable = false, precision = 10, scale = 2)
    private BigDecimal discountApplied;

    @Column(name = "used_at", nullable = false, updatable = false)
    private Instant usedAt = Instant.now();

    public CouponUsage(Coupon coupon, Customer customer, BigDecimal discountApplied) {
        this.coupon = coupon;
        this.customer = customer;
        this.discountApplied = discountApplied;
    }
}
