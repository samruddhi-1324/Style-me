package com.styleme.inventory.entity;

/**
 * SRS Section 25 — Stock movement event types.
 * PURCHASE    : Order confirmed, stock deducted.
 * RESERVATION : Cart/checkout hold placed on stock.
 * RELEASE     : Reservation cancelled or expired.
 * DEDUCTION   : Final stock deduction on order completion.
 * CANCELLATION: Order cancelled, stock returned.
 * RETURN      : Returned item restocked.
 * RESTOCK     : New stock received.
 * ADJUSTMENT  : Manual admin stock correction.
 * DAMAGED     : Damaged/shrinkage write-off.
 * TRANSFER    : Inter-location transfer.
 */
public enum MovementType {
    PURCHASE,
    RESERVATION,
    RELEASE,
    DEDUCTION,
    CANCELLATION,
    RETURN,
    RESTOCK,
    ADJUSTMENT,
    DAMAGED,
    TRANSFER
}
