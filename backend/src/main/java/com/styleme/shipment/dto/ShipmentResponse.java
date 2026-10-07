package com.styleme.shipment.dto;

import com.styleme.shipment.entity.ShipmentStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/**
 * Response DTO for a shipment.
 *
 * Exposes all shipment and tracking information to the client.
 * Events are always returned in chronological DESC order (most recent first).
 *
 * SRS Section 105: Tracking data must never be fabricated.
 * All fields must come from real backend records.
 */
public record ShipmentResponse(
        String id,
        String orderId,
        String orderNumber,
        ShipmentStatus status,

        // Carrier info
        String carrier,
        String trackingReference,
        String trackingUrl,
        String shippingMethod,

        // Address snapshot
        String recipientName,
        String recipientPhone,
        String addressLine1,
        String addressLine2,
        String city,
        String state,
        String postalCode,
        String country,

        // Fulfillment timestamps
        Instant dispatchedAt,
        LocalDate estimatedDeliveryDate,
        Instant deliveredAt,

        Instant createdAt,
        Instant updatedAt,

        /** Tracking timeline events, most recent first. */
        List<ShipmentEventResponse> events
) {}
