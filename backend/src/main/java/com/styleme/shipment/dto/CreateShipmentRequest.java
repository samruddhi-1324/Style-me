package com.styleme.shipment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Request DTO for creating a shipment record for a CONFIRMED order.
 *
 * An admin sends this after the order is confirmed and ready for dispatch.
 * The shipping address is auto-copied from the Order record; it is not re-supplied here.
 */
public record CreateShipmentRequest(

        @NotBlank(message = "Order ID is required")
        String orderId,

        /** Logistics partner (e.g. Delhivery, Bluedart, MOCK). */
        @NotBlank(message = "Carrier is required")
        @Size(max = 100, message = "Carrier name must not exceed 100 characters")
        String carrier,

        /**
         * Tracking number issued by the carrier.
         * May be null if not yet known at creation time; can be updated later.
         * SRS Section 105: Must not be fabricated.
         */
        @Size(max = 255, message = "Tracking reference must not exceed 255 characters")
        String trackingReference,

        /** Public carrier tracking URL. Optional. */
        String trackingUrl,

        /** Shipping method (e.g. STANDARD, EXPRESS). */
        @Size(max = 50, message = "Shipping method must not exceed 50 characters")
        String shippingMethod,

        /** Expected delivery date set by admin or estimated from carrier. */
        LocalDate estimatedDeliveryDate
) {}
