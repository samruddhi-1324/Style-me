package com.styleme.shipment.service;

import com.styleme.common.exception.BadRequestException;
import com.styleme.common.exception.ConflictException;
import com.styleme.common.exception.ForbiddenException;
import com.styleme.common.exception.ResourceNotFoundException;
import com.styleme.order.entity.Order;
import com.styleme.order.entity.OrderStatus;
import com.styleme.order.repository.OrderRepository;
import com.styleme.shipment.dto.*;
import com.styleme.shipment.entity.Shipment;
import com.styleme.shipment.entity.ShipmentEvent;
import com.styleme.shipment.entity.ShipmentStatus;
import com.styleme.shipment.repository.ShipmentEventRepository;
import com.styleme.shipment.repository.ShipmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Core shipment and fulfillment service.
 *
 * SRS Section 105 (Shipping Domain):
 *  - Shipment creation, tracking reference, shipment status, shipment events, order tracking.
 *  - Real shipping-provider integration is deferred to a later integration phase.
 *  - Tracking data must never be fabricated.
 *
 * This service also drives Order status transitions as shipment lifecycle advances:
 *  - Shipment DISPATCHED  →  Order SHIPPED
 *  - Shipment DELIVERED   →  Order DELIVERED
 */
@Service
@Transactional
public class ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final ShipmentEventRepository shipmentEventRepository;
    private final OrderRepository orderRepository;

    public ShipmentService(
            ShipmentRepository shipmentRepository,
            ShipmentEventRepository shipmentEventRepository,
            OrderRepository orderRepository) {
        this.shipmentRepository = shipmentRepository;
        this.shipmentEventRepository = shipmentEventRepository;
        this.orderRepository = orderRepository;
    }

    // =========================================================================
    // Shipment Creation (Admin only)
    // =========================================================================

    /**
     * Create a shipment for a CONFIRMED order.
     *
     * Pre-conditions:
     *  - Order must exist.
     *  - Order must be in CONFIRMED status (paid, inventory already deducted).
     *  - No existing shipment for the order (prevents duplicates).
     *
     * Post-conditions:
     *  - Shipment record created with PENDING status.
     *  - Order status advanced to PROCESSING.
     *  - Address snapshot copied from the Order.
     */
    public ShipmentResponse createShipment(CreateShipmentRequest request) {
        Order order = orderRepository.findById(request.orderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + request.orderId()));

        if (order.getStatus() != OrderStatus.CONFIRMED) {
            throw new BadRequestException(
                    "Cannot create shipment for order in status: " + order.getStatus()
                            + ". Order must be CONFIRMED.");
        }

        if (shipmentRepository.existsByOrderId(request.orderId())) {
            throw new ConflictException("Shipment already exists for order: " + request.orderId());
        }

        Shipment shipment = new Shipment();
        shipment.setId(UUID.randomUUID().toString());
        shipment.setOrder(order);
        shipment.setStatus(ShipmentStatus.PENDING);
        shipment.setCarrier(request.carrier());
        shipment.setTrackingReference(request.trackingReference());
        shipment.setTrackingUrl(request.trackingUrl());
        shipment.setShippingMethod(request.shippingMethod());
        shipment.setEstimatedDeliveryDate(request.estimatedDeliveryDate());

        // Copy address snapshot from order
        shipment.setRecipientName(order.getShippingName());
        shipment.setRecipientPhone(order.getShippingPhone());
        shipment.setAddressLine1(order.getShippingLine1());
        shipment.setAddressLine2(order.getShippingLine2());
        shipment.setCity(order.getShippingCity());
        shipment.setState(order.getShippingState());
        shipment.setPostalCode(order.getShippingPostal());
        shipment.setCountry(order.getShippingCountry());

        shipmentRepository.save(shipment);

        // Advance order to PROCESSING
        order.setStatus(OrderStatus.PROCESSING);
        orderRepository.save(order);

        return toResponse(shipment);
    }

    // =========================================================================
    // Shipment Status Update (Admin only)
    // =========================================================================

    /**
     * Update an existing shipment (status, carrier info, estimated delivery date).
     *
     * Status transition rules:
     *  PENDING          → PROCESSING, DISPATCHED, FAILED
     *  PROCESSING       → DISPATCHED, FAILED
     *  DISPATCHED       → IN_TRANSIT, FAILED        (also sets Order → SHIPPED)
     *  IN_TRANSIT       → OUT_FOR_DELIVERY, FAILED
     *  OUT_FOR_DELIVERY → DELIVERED, FAILED         (also sets Order → DELIVERED if delivered)
     *  DELIVERED        → (terminal — no further transitions)
     *  FAILED           → RETURNED
     *  RETURNED         → (terminal)
     *
     * Tracking reference may be updated if not yet set (e.g. carrier provides it after pickup).
     */
    public ShipmentResponse updateShipment(String shipmentId, UpdateShipmentRequest request) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found: " + shipmentId));

        if (request.status() != null) {
            validateStatusTransition(shipment.getStatus(), request.status());
            applyStatusTransition(shipment, request.status());
        }

        if (request.carrier() != null) {
            shipment.setCarrier(request.carrier());
        }
        if (request.trackingReference() != null) {
            shipment.setTrackingReference(request.trackingReference());
        }
        if (request.trackingUrl() != null) {
            shipment.setTrackingUrl(request.trackingUrl());
        }
        if (request.estimatedDeliveryDate() != null) {
            shipment.setEstimatedDeliveryDate(request.estimatedDeliveryDate());
        }

        shipmentRepository.save(shipment);
        return toResponse(shipment);
    }

    // =========================================================================
    // Shipment Event (Tracking Timeline) — Admin only
    // =========================================================================

    /**
     * Append a tracking event to the shipment's timeline.
     *
     * SRS Section 105: Events must come from real carrier data only.
     * The caller (admin) is responsible for supplying real occurred_at timestamps.
     */
    public ShipmentEventResponse addEvent(String shipmentId, AddShipmentEventRequest request) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found: " + shipmentId));

        ShipmentEvent event = new ShipmentEvent();
        event.setId(UUID.randomUUID().toString());
        event.setShipment(shipment);
        event.setDescription(request.description());
        event.setLocation(request.location());
        event.setOccurredAt(request.occurredAt());

        shipmentEventRepository.save(event);

        return toEventResponse(event);
    }

    // =========================================================================
    // Read operations
    // =========================================================================

    /** Get full shipment details by shipment ID (admin). */
    @Transactional(readOnly = true)
    public ShipmentResponse getShipmentById(String shipmentId) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found: " + shipmentId));
        return toResponse(shipment);
    }

    /** Get the shipment for a given order (admin). */
    @Transactional(readOnly = true)
    public ShipmentResponse getShipmentByOrderId(String orderId) {
        Shipment shipment = shipmentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("No shipment found for order: " + orderId));
        return toResponse(shipment);
    }

    /**
     * Customer-facing: get the shipment for a specific order, with ownership check.
     * Customers may only view shipments for their own orders.
     */
    @Transactional(readOnly = true)
    public ShipmentResponse getShipmentForCustomerOrder(String orderId, UUID customerId) {
        Shipment shipment = shipmentRepository.findByOrderIdAndCustomerUserId(orderId, customerId)
                .orElseThrow(() -> new ResourceNotFoundException("No shipment found for order: " + orderId));
        return toResponse(shipment);
    }

    // =========================================================================
    // Internal helpers
    // =========================================================================

    /**
     * Validate that the requested status transition is legal.
     * Throws BadRequestException if the transition is not allowed.
     */
    private void validateStatusTransition(ShipmentStatus from, ShipmentStatus to) {
        boolean valid = switch (from) {
            case PENDING          -> to == ShipmentStatus.PROCESSING
                                  || to == ShipmentStatus.DISPATCHED
                                  || to == ShipmentStatus.FAILED;
            case PROCESSING       -> to == ShipmentStatus.DISPATCHED
                                  || to == ShipmentStatus.FAILED;
            case DISPATCHED       -> to == ShipmentStatus.IN_TRANSIT
                                  || to == ShipmentStatus.FAILED;
            case IN_TRANSIT       -> to == ShipmentStatus.OUT_FOR_DELIVERY
                                  || to == ShipmentStatus.FAILED;
            case OUT_FOR_DELIVERY -> to == ShipmentStatus.DELIVERED
                                  || to == ShipmentStatus.FAILED;
            case FAILED           -> to == ShipmentStatus.RETURNED;
            // Terminal states
            case DELIVERED, RETURNED -> false;
        };

        if (!valid) {
            throw new BadRequestException(
                    "Invalid shipment status transition: " + from + " → " + to);
        }
    }

    /**
     * Apply the status transition side-effects:
     *  - Set timestamps on the Shipment.
     *  - Mirror the new state to the parent Order when appropriate.
     */
    private void applyStatusTransition(Shipment shipment, ShipmentStatus newStatus) {
        shipment.setStatus(newStatus);
        Order order = shipment.getOrder();

        switch (newStatus) {
            case DISPATCHED -> {
                shipment.setDispatchedAt(Instant.now());
                order.setStatus(OrderStatus.SHIPPED);
                orderRepository.save(order);
            }
            case OUT_FOR_DELIVERY -> {
                order.setStatus(OrderStatus.OUT_FOR_DELIVERY);
                orderRepository.save(order);
            }
            case DELIVERED -> {
                shipment.setDeliveredAt(Instant.now());
                order.setStatus(OrderStatus.DELIVERED);
                orderRepository.save(order);
            }
            // PENDING, PROCESSING, IN_TRANSIT, FAILED, RETURNED → no special Order transition
            default -> { /* no additional side-effects */ }
        }
    }

    // =========================================================================
    // Mapping
    // =========================================================================

    private ShipmentResponse toResponse(Shipment s) {
        List<ShipmentEventResponse> eventResponses = s.getEvents().stream()
                .map(this::toEventResponse)
                .toList();

        return new ShipmentResponse(
                s.getId(),
                s.getOrder().getId(),
                s.getOrder().getOrderNumber(),
                s.getStatus(),
                s.getCarrier(),
                s.getTrackingReference(),
                s.getTrackingUrl(),
                s.getShippingMethod(),
                s.getRecipientName(),
                s.getRecipientPhone(),
                s.getAddressLine1(),
                s.getAddressLine2(),
                s.getCity(),
                s.getState(),
                s.getPostalCode(),
                s.getCountry(),
                s.getDispatchedAt(),
                s.getEstimatedDeliveryDate(),
                s.getDeliveredAt(),
                s.getCreatedAt(),
                s.getUpdatedAt(),
                eventResponses
        );
    }

    private ShipmentEventResponse toEventResponse(ShipmentEvent e) {
        return new ShipmentEventResponse(
                e.getId(),
                e.getDescription(),
                e.getLocation(),
                e.getOccurredAt(),
                e.getCreatedAt()
        );
    }
}
