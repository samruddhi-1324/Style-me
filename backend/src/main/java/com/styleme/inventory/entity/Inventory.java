package com.styleme.inventory.entity;

import com.styleme.product.entity.Product;
import com.styleme.product.entity.ProductVariant;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Inventory aggregate root.
 * SRS Section 24: Stock quantity, available quantity, reserved quantity,
 * low-stock threshold, out-of-stock, stock adjustments, inventory history.
 *
 * Concurrency safety (SRS Section 99):
 * - @Version field enables JPA optimistic locking.
 * - InventoryService uses @Lock(PESSIMISTIC_WRITE) for critical reserve/deduct operations.
 * - DB constraints prevent quantity < 0 and reserved > quantity.
 */
@Entity
@Table(name = "inventory")
@Getter
@Setter
@NoArgsConstructor
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id")
    private ProductVariant variant;

    @Column(nullable = false, unique = true, length = 100)
    private String sku;

    /** Total physical stock on hand */
    @Column(nullable = false)
    private int quantity = 0;

    /** Quantity held by active cart/order reservations */
    @Column(nullable = false)
    private int reserved = 0;

    /** Threshold below which item is considered "low stock" */
    @Column(name = "low_stock_threshold", nullable = false)
    private int lowStockThreshold = 5;

    /**
     * JPA optimistic locking version.
     * Updated automatically on every flush; concurrent writers get OptimisticLockException.
     */
    @Version
    @Column(nullable = false)
    private Long version = 0L;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @OneToMany(mappedBy = "inventory", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<InventoryMovement> movements = new ArrayList<>();

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }

    // -------------------------------------------------------------------------
    // Derived / business helpers
    // -------------------------------------------------------------------------

    /** Stock available to sell = total quantity – reserved */
    public int getAvailable() {
        return Math.max(0, quantity - reserved);
    }

    public boolean isInStock() {
        return getAvailable() > 0;
    }

    public boolean isLowStock() {
        return isInStock() && getAvailable() <= lowStockThreshold;
    }

    public boolean isOutOfStock() {
        return getAvailable() == 0;
    }

    // -------------------------------------------------------------------------
    // Convenience constructor
    // -------------------------------------------------------------------------

    public Inventory(Product product, ProductVariant variant, String sku, int quantity) {
        this.product = product;
        this.variant = variant;
        this.sku = sku;
        this.quantity = quantity;
    }

    public Inventory(Product product, String sku, int quantity) {
        this(product, null, sku, quantity);
    }
}
