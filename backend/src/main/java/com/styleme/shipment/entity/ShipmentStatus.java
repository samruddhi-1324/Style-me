package com.styleme.shipment.entity;

/**
 * Shipment state machine per SRS Section 105.
 *
 * Normal lifecycle:
 *   PENDING → PROCESSING → DISPATCHED → IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED
 *
 * Exception states:
 *   FAILED, RETURNED
 *
 * Transitions are enforced by ShipmentService.
 * Frontend displays only; all state changes originate from the backend or admin.
 */
public enum ShipmentStatus {

    /** Shipment record created; not yet picked up by carrier. */
    PENDING,

    /** Fulfillment is being processed internally (picking, packing). */
    PROCESSING,

    /** Package handed over to carrier and dispatched from warehouse. */
    DISPATCHED,

    /** Package is in transit with carrier. */
    IN_TRANSIT,

    /** Package is out for last-mile delivery. */
    OUT_FOR_DELIVERY,

    /** Package successfully delivered to recipient. */
    DELIVERED,

    /** Delivery failed (e.g. recipient not available, address issue). */
    FAILED,

    /** Package returned to origin (after failed delivery or customer return). */
    RETURNED
}
