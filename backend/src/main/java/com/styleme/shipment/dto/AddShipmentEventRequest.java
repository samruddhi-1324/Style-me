package com.styleme.shipment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

/**
 * Request DTO for appending a tracking event to a shipment's timeline.
 *
 * SRS Section 105: Tracking data must never be invented.
 * Events must come from real carrier updates or admin records.
 */
public record AddShipmentEventRequest(

        @NotBlank(message = "Event description is required")
        String description,

        /** Physical location of the event (e.g. "Mumbai Hub"). Optional. */
        String location,

        /**
         * When this event occurred.
         * Must be the real event timestamp (e.g. from carrier webhook),
         * not the current server time.
         */
        @NotNull(message = "occurredAt timestamp is required")
        Instant occurredAt
) {}
