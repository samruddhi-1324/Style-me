package com.styleme.order.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Snapshot of a single line item at time of order placement.
 * Product/variant data is captured as strings to remain accurate
 * even if the catalog is later updated or deleted.
 */
@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(name = "product_id", nullable = false, length = 100)
    private String productId;

    @Column(name = "variant_id")
    private UUID variantId;

    /** Snapshot of product name at time of order */
    @Column(name = "product_name", nullable = false, length = 255)
    private String productName;

    /** Snapshot of variant name (color) at time of order */
    @Column(name = "variant_name", length = 255)
    private String variantName;

    /** SKU at time of order (for inventory audit) */
    @Column(nullable = false, length = 100)
    private String sku;

    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;

    @Column(nullable = false)
    private int quantity;

    @Column(name = "line_total", nullable = false, precision = 12, scale = 2)
    private BigDecimal lineTotal;
}
