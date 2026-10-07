package com.styleme.shipment.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * A single tracking event in a shipment's timeline.
 *
 * SRS Section 105: Shipment events must come from backend records only.
 * Events are appended by admins or (future) carrier webhook integrations.
 * Fabricating events is strictly prohibited.
 */
@Entity
@Table(name = "shipment_events")
@Getter
@Setter
@NoArgsConstructor
public class ShipmentEvent {

    @Id
    @Column(length = 36, nullable = false, updatable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "shipment_id", nullable = false)
    private Shipment shipment;

    /**
     * Human-readable description of this event.
     * Examples: "Package picked up at origin facility", "Arrived at Delhi Hub", "Out for delivery".
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    /**
     * Physical location where this event was recorded, if available.
     * Examples: "Mumbai Hub", "Delhi Sort Center".
     */
    @Column(length = 255)
    private String location;

    /**
     * When this event occurred.
     * Set explicitly by admin or incoming webhook — must reflect real carrier data.
     */
    @Column(name = "occurred_at", nullable = false)
    private Instant occurredAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
