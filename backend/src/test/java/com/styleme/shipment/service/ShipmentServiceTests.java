package com.styleme.shipment.service;

import com.styleme.common.exception.BadRequestException;
import com.styleme.common.exception.ConflictException;
import com.styleme.common.exception.ResourceNotFoundException;
import com.styleme.customer.entity.Customer;
import com.styleme.order.entity.Order;
import com.styleme.order.entity.OrderStatus;
import com.styleme.order.repository.OrderRepository;
import com.styleme.shipment.dto.*;
import com.styleme.shipment.entity.Shipment;
import com.styleme.shipment.entity.ShipmentEvent;
import com.styleme.shipment.entity.ShipmentStatus;
import com.styleme.shipment.repository.ShipmentEventRepository;
import com.styleme.shipment.repository.ShipmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ShipmentServiceTests {

    @Mock private ShipmentRepository shipmentRepository;
    @Mock private ShipmentEventRepository shipmentEventRepository;
    @Mock private OrderRepository orderRepository;

    private ShipmentService shipmentService;

    private Order order;
    private Shipment shipment;

    @BeforeEach
    void setUp() {
        shipmentService = new ShipmentService(shipmentRepository, shipmentEventRepository, orderRepository);

        Customer customer = new Customer();

        order = new Order();
        order.setId("order-1");
        order.setOrderNumber("SM-20261005-00001");
        order.setCustomer(customer);
        order.setStatus(OrderStatus.CONFIRMED);
        order.setGrandTotal(new BigDecimal("2500.00"));
        order.setShippingName("Test User");
        order.setShippingPhone("9999999999");
        order.setShippingLine1("123 Main Street");
        order.setShippingLine2(null);
        order.setShippingCity("Mumbai");
        order.setShippingState("Maharashtra");
        order.setShippingPostal("400001");
        order.setShippingCountry("India");

        shipment = new Shipment();
        shipment.setId(UUID.randomUUID().toString());
        shipment.setOrder(order);
        shipment.setStatus(ShipmentStatus.PENDING);
        shipment.setCarrier("MOCK");
        shipment.setTrackingReference(null);
        shipment.setEvents(new ArrayList<>());
    }

    // =========================================================================
    // Test 1: createShipment — success path
    // =========================================================================

    @Test
    void createShipment_forConfirmedOrder_createsShipmentAndAdvancesOrderToProcessing() {
        CreateShipmentRequest req = new CreateShipmentRequest(
                "order-1",
                "Delhivery",
                null,              // tracking reference not yet known
                null,
                "STANDARD",
                LocalDate.now().plusDays(5)
        );

        when(orderRepository.findById("order-1")).thenReturn(Optional.of(order));
        when(shipmentRepository.existsByOrderId("order-1")).thenReturn(false);
        when(shipmentRepository.save(any(Shipment.class))).thenAnswer(i -> i.getArgument(0));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));

        ShipmentResponse response = shipmentService.createShipment(req);

        assertNotNull(response);
        assertEquals(ShipmentStatus.PENDING, response.status());
        assertEquals("Delhivery", response.carrier());
        assertEquals("SM-20261005-00001", response.orderNumber());
        assertEquals("Mumbai", response.city());

        // Order must be advanced to PROCESSING
        verify(orderRepository).save(argThat(o -> o.getStatus() == OrderStatus.PROCESSING));
    }

    // =========================================================================
    // Test 2: createShipment — fails when order is not CONFIRMED
    // =========================================================================

    @Test
    void createShipment_forPlacedOrder_throwsBadRequest() {
        order.setStatus(OrderStatus.PLACED);
        CreateShipmentRequest req = new CreateShipmentRequest(
                "order-1", "Delhivery", null, null, "STANDARD", null
        );

        when(orderRepository.findById("order-1")).thenReturn(Optional.of(order));

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> shipmentService.createShipment(req));

        assertTrue(ex.getMessage().contains("CONFIRMED"));
    }

    // =========================================================================
    // Test 3: createShipment — fails when shipment already exists
    // =========================================================================

    @Test
    void createShipment_whenShipmentAlreadyExists_throwsConflict() {
        CreateShipmentRequest req = new CreateShipmentRequest(
                "order-1", "Delhivery", null, null, "STANDARD", null
        );

        when(orderRepository.findById("order-1")).thenReturn(Optional.of(order));
        when(shipmentRepository.existsByOrderId("order-1")).thenReturn(true);

        assertThrows(ConflictException.class, () -> shipmentService.createShipment(req));
    }

    // =========================================================================
    // Test 4: updateShipment DISPATCHED — mirrors order to SHIPPED
    // =========================================================================

    @Test
    void updateShipment_toDispatched_setsDispatchedAtAndOrderToShipped() {
        UpdateShipmentRequest req = new UpdateShipmentRequest(
                ShipmentStatus.DISPATCHED,
                null,
                "DL-123456",
                null,
                null
        );

        when(shipmentRepository.findById(shipment.getId())).thenReturn(Optional.of(shipment));
        when(shipmentRepository.save(any(Shipment.class))).thenAnswer(i -> i.getArgument(0));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));

        ShipmentResponse response = shipmentService.updateShipment(shipment.getId(), req);

        assertEquals(ShipmentStatus.DISPATCHED, response.status());
        assertNotNull(response.dispatchedAt());
        // Order must advance to SHIPPED
        verify(orderRepository).save(argThat(o -> o.getStatus() == OrderStatus.SHIPPED));
    }

    // =========================================================================
    // Test 5: updateShipment DELIVERED — mirrors order to DELIVERED
    // =========================================================================

    @Test
    void updateShipment_toDelivered_setsDeliveredAtAndOrderToDelivered() {
        // Advance shipment to OUT_FOR_DELIVERY first (valid starting point)
        shipment.setStatus(ShipmentStatus.OUT_FOR_DELIVERY);

        UpdateShipmentRequest req = new UpdateShipmentRequest(
                ShipmentStatus.DELIVERED, null, null, null, null
        );

        when(shipmentRepository.findById(shipment.getId())).thenReturn(Optional.of(shipment));
        when(shipmentRepository.save(any(Shipment.class))).thenAnswer(i -> i.getArgument(0));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));

        ShipmentResponse response = shipmentService.updateShipment(shipment.getId(), req);

        assertEquals(ShipmentStatus.DELIVERED, response.status());
        assertNotNull(response.deliveredAt());
        verify(orderRepository).save(argThat(o -> o.getStatus() == OrderStatus.DELIVERED));
    }

    // =========================================================================
    // Test 6: invalid status transition throws BadRequestException
    // =========================================================================

    @Test
    void updateShipment_invalidTransition_throwsBadRequest() {
        // DELIVERED → DISPATCHED is illegal
        shipment.setStatus(ShipmentStatus.DELIVERED);

        UpdateShipmentRequest req = new UpdateShipmentRequest(
                ShipmentStatus.DISPATCHED, null, null, null, null
        );

        when(shipmentRepository.findById(shipment.getId())).thenReturn(Optional.of(shipment));

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> shipmentService.updateShipment(shipment.getId(), req));

        assertTrue(ex.getMessage().contains("Invalid shipment status transition"));
    }

    // =========================================================================
    // Test 7: addEvent — appends tracking event to shipment
    // =========================================================================

    @Test
    void addEvent_toExistingShipment_persistsEventWithCorrectData() {
        Instant eventTime = Instant.now().minusSeconds(3600);
        AddShipmentEventRequest req = new AddShipmentEventRequest(
                "Package arrived at Mumbai Hub",
                "Mumbai Hub",
                eventTime
        );

        ShipmentEvent savedEvent = new ShipmentEvent();
        savedEvent.setId(UUID.randomUUID().toString());
        savedEvent.setShipment(shipment);
        savedEvent.setDescription(req.description());
        savedEvent.setLocation(req.location());
        savedEvent.setOccurredAt(req.occurredAt());

        when(shipmentRepository.findById(shipment.getId())).thenReturn(Optional.of(shipment));
        when(shipmentEventRepository.save(any(ShipmentEvent.class))).thenReturn(savedEvent);

        ShipmentEventResponse response = shipmentService.addEvent(shipment.getId(), req);

        assertNotNull(response);
        assertEquals("Package arrived at Mumbai Hub", response.description());
        assertEquals("Mumbai Hub", response.location());
        assertEquals(eventTime, response.occurredAt());
    }

    // =========================================================================
    // Test 8: getShipmentByOrderId — not found throws ResourceNotFoundException
    // =========================================================================

    @Test
    void getShipmentByOrderId_whenNoShipment_throwsResourceNotFound() {
        when(shipmentRepository.findByOrderId("order-99")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> shipmentService.getShipmentByOrderId("order-99"));
    }
}
