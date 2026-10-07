package com.styleme.shipment.entity;

import com.styleme.order.entity.Order;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Shipment entity — one shipment per order (1:1 with Order, one-to-many with ShipmentEvent).
 *
 * SRS Section 105:
 *  - Shipment creation, tracking reference, shipment status, shipment events, order tracking.
 *  - Real shipping-provider integration is a later integration phase.
 *  - Do not fabricate tracking information.
 *
 * All address fields here are a snapshot copied from the Order at shipment creation time.
 */
@Entity
@Table(name = "shipments")
@Getter
@Setter
@NoArgsConstructor
public class Shipment {

    @Id
    @Column(length = 36, nullable = false, updatable = false)
    private String id;

    /** Each order has at most one shipment record. */
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ShipmentStatus status = ShipmentStatus.PENDING;

    /** Logistics partner name (e.g. Delhivery, Bluedart, MOCK). */
    @Column(length = 100)
    private String carrier;

    /**
     * Tracking number issued by the carrier.
     * SRS Section 105: Must never be fabricated.
     * Null until carrier assigns one.
     */
    @Column(name = "tracking_reference", length = 255)
    private String trackingReference;

    /** Public carrier tracking URL (optional). */
    @Column(name = "tracking_url", columnDefinition = "TEXT")
    private String trackingUrl;

    /** Shipping method used (e.g. STANDARD, EXPRESS). */
    @Column(name = "shipping_method", length = 50)
    private String shippingMethod;

    // --- Destination address snapshot (copied from Order.shipping* at creation time) ---

    @Column(name = "recipient_name", length = 200)
    private String recipientName;

    @Column(name = "recipient_phone", length = 20)
    private String recipientPhone;

    @Column(name = "address_line1", length = 255)
    private String addressLine1;

    @Column(name = "address_line2", length = 255)
    private String addressLine2;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String state;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @Column(length = 100)
    private String country = "India";

    // --- Fulfillment timestamps ---

    /** When the shipment was dispatched (handed to carrier). */
    @Column(name = "dispatched_at")
    private Instant dispatchedAt;

    /** Estimated delivery date provided by carrier or set by admin. */
    @Column(name = "estimated_delivery_date")
    private LocalDate estimatedDeliveryDate;

    /** Actual delivery timestamp (set when status transitions to DELIVERED). */
    @Column(name = "delivered_at")
    private Instant deliveredAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    /** Chronological tracking events for this shipment. */
    @OneToMany(mappedBy = "shipment", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("occurredAt DESC")
    private List<ShipmentEvent> events = new ArrayList<>();

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
