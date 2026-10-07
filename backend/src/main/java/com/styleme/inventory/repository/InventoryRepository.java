package com.styleme.inventory.repository;

import com.styleme.inventory.entity.Inventory;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Inventory.
 *
 * SRS Section 99 (Concurrency safety):
 * - findBySkuForUpdate uses PESSIMISTIC_WRITE lock to serialize concurrent reserve/deduct.
 * - All mutation operations in InventoryService must use the locked query.
 */
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    Optional<Inventory> findBySku(String sku);

    List<Inventory> findByProductId(String productId);

    Optional<Inventory> findByVariantId(UUID variantId);

    /**
     * Pessimistic write lock — used by InventoryService for all mutating operations.
     * Prevents concurrent transactions from reading stale data and overselling.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM Inventory i WHERE i.sku = :sku")
    Optional<Inventory> findBySkuForUpdate(@Param("sku") String sku);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM Inventory i WHERE i.id = :id")
    Optional<Inventory> findByIdForUpdate(@Param("id") Long id);

    /** Low-stock products: available (quantity - reserved) <= lowStockThreshold */
    @Query("SELECT i FROM Inventory i WHERE (i.quantity - i.reserved) > 0 AND (i.quantity - i.reserved) <= i.lowStockThreshold")
    List<Inventory> findLowStockItems();

    /** Out-of-stock: available = 0 */
    @Query("SELECT i FROM Inventory i WHERE (i.quantity - i.reserved) <= 0")
    List<Inventory> findOutOfStockItems();
}
