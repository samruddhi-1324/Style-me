package com.styleme.shipment.dto;

import com.styleme.shipment.entity.ShipmentStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Request DTO for updating an existing shipment.
 *
 * Admins use this to:
 *  - Advance the shipment status through its lifecycle.
 *  - Update carrier / tracking reference (e.g. once the carrier assigns a tracking number).
 *  - Record the estimated or actual delivery date.
 *
 * All fields are optional; null means "do not change".
 */
public record UpdateShipmentRequest(

        /** New status to transition to. Null means no status change. */
        ShipmentStatus status,

        @Size(max = 100, message = "Carrier name must not exceed 100 characters")
        String carrier,

        /**
         * Tracking number from the carrier.
         * SRS Section 105: Must never be fabricated — only set from real carrier data.
         */
        @Size(max = 255, message = "Tracking reference must not exceed 255 characters")
        String trackingReference,

        /** Carrier tracking URL. Optional. */
        String trackingUrl,

        LocalDate estimatedDeliveryDate
) {}
