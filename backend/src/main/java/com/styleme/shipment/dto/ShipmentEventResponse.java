package com.styleme.shipment.dto;

import java.time.Instant;

/**
 * Response DTO for a single shipment tracking event.
 *
 * SRS Section 105: Tracking data must never be invented.
 * All events returned here originate from backend records only.
 */
public record ShipmentEventResponse(
        String id,
        String description,
        String location,
        Instant occurredAt,
        Instant createdAt
) {}
