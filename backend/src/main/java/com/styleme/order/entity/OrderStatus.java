package com.styleme.order.entity;

/**
 * Order state machine per SRS Section 103.
 *
 * Normal lifecycle:
 *   PLACED → CONFIRMED → PROCESSING → SHIPPED → OUT_FOR_DELIVERY → DELIVERED
 *
 * Exception/terminal states:
 *   CANCELLED, PAYMENT_FAILED, RETURN_REQUESTED, RETURNED, REFUND_INITIATED, REFUNDED
 *
 * The backend defines all legal transitions; the frontend only displays states.
 */
public enum OrderStatus {

    // --- Active lifecycle ---
    PLACED,
    CONFIRMED,
    PROCESSING,
    SHIPPED,
    OUT_FOR_DELIVERY,
    DELIVERED,

    // --- Exception states ---
    CANCELLED,
    PAYMENT_FAILED,

    // --- Post-delivery ---
    RETURN_REQUESTED,
    RETURNED,
    REFUND_INITIATED,
    REFUNDED
}
