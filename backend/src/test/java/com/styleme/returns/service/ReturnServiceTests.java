package com.styleme.returns.service;

import com.styleme.common.exception.BadRequestException;
import com.styleme.customer.entity.Customer;
import com.styleme.customer.repository.CustomerRepository;
import com.styleme.order.entity.Order;
import com.styleme.order.entity.OrderItem;
import com.styleme.order.entity.OrderStatus;
import com.styleme.order.repository.OrderRepository;
import com.styleme.order.service.OrderService;
import com.styleme.returns.dto.CreateReturnRequest;
import com.styleme.returns.dto.ReturnDecisionRequest;
import com.styleme.returns.dto.ReturnItemRequest;
import com.styleme.returns.dto.ReturnRequestResponse;
import com.styleme.returns.entity.Refund;
import com.styleme.returns.entity.RefundStatus;
import com.styleme.returns.entity.ReturnRequest;
import com.styleme.returns.entity.ReturnStatus;
import com.styleme.returns.repository.RefundRepository;
import com.styleme.returns.repository.ReturnRequestRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReturnServiceTests {

    @Mock private ReturnRequestRepository returnRequestRepository;
    @Mock private RefundRepository refundRepository;
    @Mock private OrderRepository orderRepository;
    @Mock private CustomerRepository customerRepository;
    @Mock private OrderService orderService;

    private ReturnService returnService;
    private Customer customer;
    private Order order;

    @BeforeEach
    void setUp() {
        returnService = new ReturnService(
                returnRequestRepository,
                refundRepository,
                orderRepository,
                customerRepository,
                orderService
        );

        customer = new Customer();
        customer.setId(UUID.randomUUID());

        order = new Order();
        order.setId("ord-123");
        order.setOrderNumber("SM-20261006-00001");
        order.setCustomer(customer);
        order.setStatus(OrderStatus.DELIVERED);

        OrderItem item = new OrderItem();
        item.setId(101L);
        item.setOrder(order);
        item.setProductId("prod-1");
        item.setProductName("Aster Frame");
        item.setVariantName("Gold");
        item.setSku("AST-GOLD-001");
        item.setUnitPrice(new BigDecimal("850.00"));
        item.setQuantity(2);
        item.setLineTotal(new BigDecimal("1700.00"));

        order.setItems(List.of(item));
    }

    @Test
    void createReturn_forDeliveredOrder_createsPendingRequest() {
        CreateReturnRequest request = new CreateReturnRequest(
                "ord-123",
                "Damaged on arrival",
                "Lens scratched during shipping",
                List.of(new ReturnItemRequest(101L, 1))
        );

        when(customerRepository.findById(customer.getId())).thenReturn(Optional.of(customer));
        when(orderRepository.findByIdAndCustomerId("ord-123", customer.getId()))
                .thenReturn(Optional.of(order));
        when(returnRequestRepository.existsByOrderIdAndStatusIn(eq("ord-123"), any())).thenReturn(false);
        when(returnRequestRepository.save(any(ReturnRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ReturnRequestResponse response = returnService.createReturn(customer.getId(), request);

        assertNotNull(response);
        assertEquals(ReturnStatus.PENDING, response.status());
        assertEquals(new BigDecimal("850.00"), response.refundAmount());
        verify(orderService).updateOrderStatus(eq("ord-123"), eq(OrderStatus.RETURN_REQUESTED), eq("CUSTOMER"), any());
    }

    @Test
    void createReturn_forNonDeliveredOrder_throwsBadRequest() {
        order.setStatus(OrderStatus.PLACED);

        CreateReturnRequest request = new CreateReturnRequest(
                "ord-123",
                "Damaged on arrival",
                null,
                List.of(new ReturnItemRequest(101L, 1))
        );

        when(customerRepository.findById(customer.getId())).thenReturn(Optional.of(customer));
        when(orderRepository.findByIdAndCustomerId("ord-123", customer.getId()))
                .thenReturn(Optional.of(order));

        assertThrows(BadRequestException.class, () -> returnService.createReturn(customer.getId(), request));
    }

    @Test
    void approveReturn_setsApprovedStatusAndRefundAmount() {
        ReturnRequest request = new ReturnRequest();
        request.setId("rr-1");
        request.setOrder(order);
        request.setCustomer(customer);
        request.setStatus(ReturnStatus.PENDING);
        request.setReason("Damaged on arrival");
        request.setRefundAmount(new BigDecimal("850.00"));
        request.setRefundStatus(RefundStatus.PENDING);
        request.setRequestedAt(Instant.now());
        request.setItems(List.of());

        when(returnRequestRepository.findById("rr-1")).thenReturn(Optional.of(request));
        when(returnRequestRepository.save(any(ReturnRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ReturnRequestResponse response = returnService.approveReturn(
                "rr-1",
                new ReturnDecisionRequest("Approved after inspection", new BigDecimal("700.00"))
        );

        assertEquals(ReturnStatus.APPROVED, response.status());
        assertEquals(new BigDecimal("700.00"), response.refundAmount());
        verify(orderService).updateOrderStatus(eq("ord-123"), eq(OrderStatus.RETURN_REQUESTED), eq("ADMIN"), any());
    }

    @Test
    void completeReturn_createsRefundEntryAndMarksRefunded() {
        ReturnRequest request = new ReturnRequest();
        request.setId("rr-2");
        request.setOrder(order);
        request.setCustomer(customer);
        request.setStatus(ReturnStatus.APPROVED);
        request.setReason("Damaged on arrival");
        request.setRefundAmount(new BigDecimal("850.00"));
        request.setRefundStatus(RefundStatus.PROCESSING);
        request.setRequestedAt(Instant.now());
        request.setItems(List.of());

        when(returnRequestRepository.findById("rr-2")).thenReturn(Optional.of(request));
        when(refundRepository.findByReturnRequestId("rr-2")).thenReturn(Optional.empty());
        when(returnRequestRepository.save(any(ReturnRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(refundRepository.save(any(Refund.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ReturnRequestResponse response = returnService.completeReturn(
                "rr-2",
                new ReturnDecisionRequest("Refund posted to original method", null)
        );

        assertEquals(ReturnStatus.COMPLETED, response.status());
        assertEquals(RefundStatus.COMPLETED, request.getRefundStatus());
        verify(refundRepository).save(any(Refund.class));
        verify(orderService).updateOrderStatus(eq("ord-123"), eq(OrderStatus.REFUNDED), eq("ADMIN"), any());
    }
}
