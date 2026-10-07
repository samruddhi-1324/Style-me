package com.styleme.inventory.service;

import com.styleme.common.exception.BadRequestException;
import com.styleme.common.exception.ConflictException;
import com.styleme.common.exception.ResourceNotFoundException;
import com.styleme.inventory.dto.*;
import com.styleme.inventory.entity.Inventory;
import com.styleme.inventory.entity.InventoryMovement;
import com.styleme.inventory.entity.MovementType;
import com.styleme.inventory.repository.InventoryMovementRepository;
import com.styleme.inventory.repository.InventoryRepository;
import com.styleme.product.entity.Product;
import com.styleme.product.entity.ProductVariant;
import com.styleme.product.repository.ProductRepository;
import com.styleme.product.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Inventory service — all stock mutation operations are concurrency-safe.
 *
 * SRS Section 99 strategy:
 *  1. PESSIMISTIC_WRITE lock acquired on Inventory row before any mutation.
 *  2. Business invariants (available > 0 before reserve/deduct) checked within
 *     the locked transaction.
 *  3. DB CHECK constraints (quantity >= 0, reserved <= quantity) provide a
 *     last-resort backstop.
 *  4. @Version optimistic locking prevents stale reads slipping through.
 *
 * This ensures: no overselling, no negative stock, no double reservation.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final InventoryMovementRepository movementRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;

    // =========================================================================
    // CREATE
    // =========================================================================

    /**
     * Create an inventory record for a product (optionally for a specific variant).
     * Admin-only. Validates no duplicate SKU.
     */
    @Transactional
    public InventoryResponse createInventory(CreateInventoryRequest req) {
        if (inventoryRepository.findBySku(req.getSku()).isPresent()) {
            throw new ConflictException("Inventory record already exists for SKU: " + req.getSku());
        }

        Product product = productRepository.findById(req.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + req.getProductId()));

        ProductVariant variant = null;
        if (req.getVariantId() != null) {
            variant = variantRepository.findById(req.getVariantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Variant not found: " + req.getVariantId()));
        }

        Inventory inventory = new Inventory(product, variant, req.getSku(), req.getQuantity());
        inventory.setLowStockThreshold(req.getLowStockThreshold());
        inventory = inventoryRepository.save(inventory);

        // Record initial stock movement if quantity > 0
        if (req.getQuantity() > 0) {
            recordMovement(inventory, MovementType.RESTOCK, req.getQuantity(), 0, req.getQuantity(),
                    null, "MANUAL", "Initial stock entry", null);
        }

        log.info("Inventory created for SKU={} qty={}", req.getSku(), req.getQuantity());
        return toResponse(inventory);
    }

    // =========================================================================
    // READ
    // =========================================================================

    @Transactional(readOnly = true)
    public InventoryResponse getBySkuId(String sku) {
        return inventoryRepository.findBySku(sku)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found for SKU: " + sku));
    }

    @Transactional(readOnly = true)
    public List<InventoryResponse> getByProductId(String productId) {
        return inventoryRepository.findByProductId(productId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InventoryResponse> getLowStockItems() {
        return inventoryRepository.findLowStockItems()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InventoryResponse> getOutOfStockItems() {
        return inventoryRepository.findOutOfStockItems()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InventoryMovementResponse> getMovementHistory(Long inventoryId) {
        return movementRepository.findByInventoryIdOrderByPerformedAtDesc(inventoryId)
                .stream().map(this::toMovementResponse).collect(Collectors.toList());
    }

    // =========================================================================
    // CONCURRENCY-SAFE MUTATIONS
    // SRS Section 99: All mutations acquire PESSIMISTIC_WRITE lock.
    // =========================================================================

    /**
     * Reserve stock for a cart/order hold.
     * Prevents overselling by checking available quantity under lock.
     */
    @Transactional
    public InventoryResponse reserve(String sku, int qty, String referenceId, String referenceType) {
        validateQty(qty);
        Inventory inv = getLockedBySku(sku);

        int available = inv.getAvailable();
        if (available < qty) {
            throw new BadRequestException(
                    String.format("Insufficient stock for SKU '%s': requested=%d, available=%d", sku, qty, available));
        }

        int before = inv.getQuantity();
        inv.setReserved(inv.getReserved() + qty);
        inv = inventoryRepository.save(inv);

        recordMovement(inv, MovementType.RESERVATION, qty, before, inv.getQuantity(),
                referenceId, referenceType, "Stock reserved", null);

        log.info("Reserved {} units of SKU={}, reference={}", qty, sku, referenceId);
        return toResponse(inv);
    }

    /**
     * Release a previously placed reservation (cart abandoned, order cancelled).
     * Returns reserved stock to available pool.
     */
    @Transactional
    public InventoryResponse release(String sku, int qty, String referenceId, String referenceType) {
        validateQty(qty);
        Inventory inv = getLockedBySku(sku);

        if (inv.getReserved() < qty) {
            throw new BadRequestException(
                    String.format("Cannot release %d units for SKU '%s': only %d are reserved", qty, sku, inv.getReserved()));
        }

        int before = inv.getQuantity();
        inv.setReserved(inv.getReserved() - qty);
        inv = inventoryRepository.save(inv);

        recordMovement(inv, MovementType.RELEASE, qty, before, inv.getQuantity(),
                referenceId, referenceType, "Reservation released", null);

        log.info("Released {} units of SKU={}, reference={}", qty, sku, referenceId);
        return toResponse(inv);
    }

    /**
     * Deduct stock on confirmed purchase: reduces both reserved and total quantity.
     * Called after payment confirmation.
     */
    @Transactional
    public InventoryResponse deduct(String sku, int qty, String referenceId, String referenceType) {
        validateQty(qty);
        Inventory inv = getLockedBySku(sku);

        if (inv.getReserved() < qty) {
            throw new BadRequestException(
                    String.format("Cannot deduct %d units for SKU '%s': only %d reserved", qty, sku, inv.getReserved()));
        }
        if (inv.getQuantity() < qty) {
            throw new BadRequestException(
                    String.format("Cannot deduct %d units for SKU '%s': only %d in stock", qty, sku, inv.getQuantity()));
        }

        int before = inv.getQuantity();
        inv.setQuantity(inv.getQuantity() - qty);
        inv.setReserved(inv.getReserved() - qty);
        inv = inventoryRepository.save(inv);

        recordMovement(inv, MovementType.DEDUCTION, -qty, before, inv.getQuantity(),
                referenceId, referenceType, "Stock deducted on purchase", null);

        log.info("Deducted {} units of SKU={}, reference={}", qty, sku, referenceId);
        return toResponse(inv);
    }

    /**
     * Restock: add new stock (receiving new shipment, returns, etc.).
     */
    @Transactional
    public InventoryResponse restock(String sku, int qty, String referenceId, String note) {
        validateQty(qty);
        Inventory inv = getLockedBySku(sku);

        int before = inv.getQuantity();
        inv.setQuantity(inv.getQuantity() + qty);
        inv = inventoryRepository.save(inv);

        recordMovement(inv, MovementType.RESTOCK, qty, before, inv.getQuantity(),
                referenceId, "MANUAL", note != null ? note : "Stock restocked", null);

        log.info("Restocked {} units of SKU={}", qty, sku);
        return toResponse(inv);
    }

    /**
     * Manual adjustment: admin correction (positive or negative via StockAdjustmentRequest).
     * Handles ADJUSTMENT, DAMAGED, TRANSFER, RETURN movements.
     */
    @Transactional
    public InventoryResponse adjust(Long inventoryId, StockAdjustmentRequest req) {
        Inventory inv = getLockedById(inventoryId);

        int delta;
        switch (req.getMovementType()) {
            case RESTOCK, RETURN, ADJUSTMENT -> delta = req.getQuantity();
            case DAMAGED, TRANSFER -> delta = -req.getQuantity();
            default -> throw new BadRequestException("Use reserve/release/deduct endpoints for movement type: " + req.getMovementType());
        }

        int before = inv.getQuantity();
        int newQty = inv.getQuantity() + delta;

        if (newQty < 0) {
            throw new BadRequestException(
                    "Adjustment would result in negative stock. Current=" + inv.getQuantity() + ", delta=" + delta);
        }
        if (newQty < inv.getReserved()) {
            throw new BadRequestException(
                    "Adjustment would result in quantity below reserved. Current=" + inv.getQuantity()
                            + ", reserved=" + inv.getReserved() + ", delta=" + delta);
        }

        inv.setQuantity(newQty);
        inv = inventoryRepository.save(inv);

        recordMovement(inv, req.getMovementType(), delta, before, newQty,
                req.getReferenceId(), req.getReferenceType(), req.getNote(), null);

        log.info("Adjusted SKU={} by {} ({}) reference={}", inv.getSku(), delta, req.getMovementType(), req.getReferenceId());
        return toResponse(inv);
    }

    // =========================================================================
    // Internal helpers
    // =========================================================================

    private Inventory getLockedBySku(String sku) {
        return inventoryRepository.findBySkuForUpdate(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found for SKU: " + sku));
    }

    private Inventory getLockedById(Long id) {
        return inventoryRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found with id: " + id));
    }

    private void validateQty(int qty) {
        if (qty <= 0) {
            throw new BadRequestException("Quantity must be greater than zero");
        }
    }

    private void recordMovement(Inventory inv, MovementType type, int delta,
                                int before, int after,
                                String refId, String refType, String note,
                                com.styleme.user.entity.User performer) {
        InventoryMovement m = new InventoryMovement(inv, type, delta, before, after, refId, refType, note, performer);
        movementRepository.save(m);
    }

    // =========================================================================
    // DTO mapping
    // =========================================================================

    public InventoryResponse toResponse(Inventory inv) {
        return InventoryResponse.builder()
                .id(inv.getId())
                .productId(inv.getProduct().getId())
                .variantId(inv.getVariant() != null ? inv.getVariant().getId() : null)
                .sku(inv.getSku())
                .quantity(inv.getQuantity())
                .reserved(inv.getReserved())
                .available(inv.getAvailable())
                .lowStockThreshold(inv.getLowStockThreshold())
                .inStock(inv.isInStock())
                .lowStock(inv.isLowStock())
                .outOfStock(inv.isOutOfStock())
                .version(inv.getVersion())
                .createdAt(inv.getCreatedAt())
                .updatedAt(inv.getUpdatedAt())
                .build();
    }

    private InventoryMovementResponse toMovementResponse(InventoryMovement m) {
        return InventoryMovementResponse.builder()
                .id(m.getId())
                .inventoryId(m.getInventory().getId())
                .sku(m.getInventory().getSku())
                .movementType(m.getMovementType())
                .quantityDelta(m.getQuantityDelta())
                .quantityBefore(m.getQuantityBefore())
                .quantityAfter(m.getQuantityAfter())
                .referenceId(m.getReferenceId())
                .referenceType(m.getReferenceType())
                .note(m.getNote())
                .performedAt(m.getPerformedAt())
                .build();
    }
}
