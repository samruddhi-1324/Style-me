package com.styleme.order.entity;

import com.styleme.customer.entity.Customer;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Order entity.
 * SRS Section 103: State controlled exclusively by backend.
 * SRS Section 100: All monetary fields are backend-authoritative snapshots.
 * Address fields are snapshots — immutable after placement.
 */
@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
public class Order {

    @Id
    @Column(length = 36, nullable = false, updatable = false)
    private String id;

    /** Human-readable order number, e.g. SM-20261005-00001 */
    @Column(name = "order_number", nullable = false, unique = true, length = 30)
    private String orderNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private OrderStatus status = OrderStatus.PLACED;

    // --- Pricing snapshot (SRS Section 100) ---

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "discount_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "coupon_code", length = 50)
    private String couponCode;

    @Column(name = "tax_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "tax_rate", nullable = false, precision = 5, scale = 4)
    private BigDecimal taxRate;

    @Column(name = "shipping_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal shippingAmount = BigDecimal.ZERO;

    @Column(name = "grand_total", nullable = false, precision = 12, scale = 2)
    private BigDecimal grandTotal;

    // --- Shipping address snapshot (immutable after order placed) ---

    @Column(name = "shipping_name", nullable = false, length = 200)
    private String shippingName;

    @Column(name = "shipping_phone", length = 20)
    private String shippingPhone;

    @Column(name = "shipping_line1", nullable = false, length = 255)
    private String shippingLine1;

    @Column(name = "shipping_line2", length = 255)
    private String shippingLine2;

    @Column(name = "shipping_city", nullable = false, length = 100)
    private String shippingCity;

    @Column(name = "shipping_state", nullable = false, length = 100)
    private String shippingState;

    @Column(name = "shipping_postal", nullable = false, length = 20)
    private String shippingPostal;

    @Column(name = "shipping_country", nullable = false, length = 100)
    private String shippingCountry = "India";

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "placed_at", nullable = false, updatable = false)
    private Instant placedAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
