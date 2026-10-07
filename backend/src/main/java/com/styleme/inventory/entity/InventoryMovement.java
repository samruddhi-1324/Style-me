package com.styleme.inventory.entity;

import com.styleme.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * Immutable audit record of every inventory quantity change.
 * SRS Section 25: Inventory changes must eventually be auditable.
 *
 * Movement types: PURCHASE, RESERVATION, RELEASE, DEDUCTION, CANCELLATION,
 *                 RETURN, RESTOCK, ADJUSTMENT, DAMAGED, TRANSFER.
 */
@Entity
@Table(name = "inventory_movements")
@Getter
@Setter
@NoArgsConstructor
public class InventoryMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "inventory_id", nullable = false)
    private Inventory inventory;

    @Enumerated(EnumType.STRING)
    @Column(name = "movement_type", nullable = false, length = 30)
    private MovementType movementType;

    /**
     * Net quantity delta: positive = stock in, negative = stock out.
     */
    @Column(name = "quantity_delta", nullable = false)
    private int quantityDelta;

    @Column(name = "quantity_before", nullable = false)
    private int quantityBefore;

    @Column(name = "quantity_after", nullable = false)
    private int quantityAfter;

    /** External reference (orderId, returnId, etc.) */
    @Column(name = "reference_id", length = 100)
    private String referenceId;

    /** Type of the reference entity (ORDER, RETURN, MANUAL, etc.) */
    @Column(name = "reference_type", length = 50)
    private String referenceType;

    @Column(columnDefinition = "TEXT")
    private String note;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by")
    private User performedBy;

    @Column(name = "performed_at", nullable = false, updatable = false)
    private Instant performedAt = Instant.now();

    // -------------------------------------------------------------------------
    // Factory constructor
    // -------------------------------------------------------------------------

    public InventoryMovement(Inventory inventory,
                             MovementType movementType,
                             int quantityDelta,
                             int quantityBefore,
                             int quantityAfter,
                             String referenceId,
                             String referenceType,
                             String note,
                             User performedBy) {
        this.inventory = inventory;
        this.movementType = movementType;
        this.quantityDelta = quantityDelta;
        this.quantityBefore = quantityBefore;
        this.quantityAfter = quantityAfter;
        this.referenceId = referenceId;
        this.referenceType = referenceType;
        this.note = note;
        this.performedBy = performedBy;
        this.performedAt = Instant.now();
    }
}
