package com.styleme.shipment.controller;

import com.styleme.auth.security.UserPrincipal;
import com.styleme.common.dto.ApiResponse;
import com.styleme.shipment.dto.*;
import com.styleme.shipment.service.ShipmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST controller for Shipment and Fulfillment operations.
 *
 * SRS Section 105 (Shipping Domain):
 *  - Admin endpoints: create, update, and add tracking events.
 *  - Customer endpoint: view own order's shipment.
 *
 * Endpoint summary:
 *  POST   /api/v1/admin/shipments                            — Create shipment (ADMIN)
 *  PATCH  /api/v1/admin/shipments/{shipmentId}               — Update shipment status / carrier (ADMIN)
 *  POST   /api/v1/admin/shipments/{shipmentId}/events        — Add tracking event (ADMIN)
 *  GET    /api/v1/admin/shipments/{shipmentId}               — Get shipment by ID (ADMIN)
 *  GET    /api/v1/admin/shipments/order/{orderId}            — Get shipment by order ID (ADMIN)
 *  GET    /api/v1/orders/{orderId}/shipment                  — Get own order's shipment (CUSTOMER)
 */
@Tag(name = "Shipments", description = "Shipment creation, status management, and order tracking")
@RestController
public class ShipmentController {

    private final ShipmentService shipmentService;

    public ShipmentController(ShipmentService shipmentService) {
        this.shipmentService = shipmentService;
    }

    // =========================================================================
    // Admin endpoints
    // =========================================================================

    @Operation(summary = "Create a shipment for a CONFIRMED order (Admin)")
    @PostMapping("/api/v1/admin/shipments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ShipmentResponse>> createShipment(
            @Valid @RequestBody CreateShipmentRequest request) {

        ShipmentResponse response = shipmentService.createShipment(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Shipment created successfully", response));
    }

    @Operation(summary = "Update shipment status, carrier, or tracking info (Admin)")
    @PatchMapping("/api/v1/admin/shipments/{shipmentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ShipmentResponse>> updateShipment(
            @PathVariable String shipmentId,
            @Valid @RequestBody UpdateShipmentRequest request) {

        ShipmentResponse response = shipmentService.updateShipment(shipmentId, request);
        return ResponseEntity.ok(ApiResponse.success("Shipment updated successfully", response));
    }

    @Operation(summary = "Append a tracking event to a shipment's timeline (Admin)")
    @PostMapping("/api/v1/admin/shipments/{shipmentId}/events")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ShipmentEventResponse>> addEvent(
            @PathVariable String shipmentId,
            @Valid @RequestBody AddShipmentEventRequest request) {

        ShipmentEventResponse response = shipmentService.addEvent(shipmentId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tracking event added successfully", response));
    }

    @Operation(summary = "Get shipment by shipment ID (Admin)")
    @GetMapping("/api/v1/admin/shipments/{shipmentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ShipmentResponse>> getShipmentById(
            @PathVariable String shipmentId) {

        ShipmentResponse response = shipmentService.getShipmentById(shipmentId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Get shipment for a given order ID (Admin)")
    @GetMapping("/api/v1/admin/shipments/order/{orderId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ShipmentResponse>> getShipmentByOrderId(
            @PathVariable String orderId) {

        ShipmentResponse response = shipmentService.getShipmentByOrderId(orderId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // =========================================================================
    // Customer endpoint
    // =========================================================================

    @Operation(summary = "Get shipment details for the authenticated customer's order")
    @GetMapping("/api/v1/orders/{orderId}/shipment")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ShipmentResponse>> getOwnOrderShipment(
            @PathVariable String orderId,
            @AuthenticationPrincipal UserPrincipal principal) {

        UUID customerId = principal.getId();
        ShipmentResponse response = shipmentService.getShipmentForCustomerOrder(
                orderId, customerId);
        return ResponseEntity.ok(ApiResponse.success("Shipment retrieved", response));
    }
}
