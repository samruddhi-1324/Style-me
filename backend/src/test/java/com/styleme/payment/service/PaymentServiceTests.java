package com.styleme.payment.service;

import com.styleme.common.exception.BadRequestException;
import com.styleme.customer.entity.Customer;
import com.styleme.customer.repository.CustomerRepository;
import com.styleme.order.entity.Order;
import com.styleme.order.entity.OrderStatus;
import com.styleme.order.repository.OrderRepository;
import com.styleme.order.service.OrderService;
import com.styleme.payment.dto.PaymentInitiateRequest;
import com.styleme.payment.dto.PaymentResponse;
import com.styleme.payment.dto.PaymentVerificationRequest;
import com.styleme.payment.entity.Payment;
import com.styleme.payment.entity.PaymentStatus;
import com.styleme.payment.provider.PaymentProvider;
import com.styleme.payment.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PaymentServiceTests {

    @Mock private PaymentRepository paymentRepository;
    @Mock private OrderRepository orderRepository;
    @Mock private CustomerRepository customerRepository;
    @Mock private OrderService orderService;
    @Mock private PaymentProvider mockProvider;

    private PaymentService paymentService;

    private UUID customerId;
    private Customer customer;
    private Order order;
    private Payment payment;
    private PaymentInitiateRequest initReq;
    private PaymentVerificationRequest verifyReq;

    @BeforeEach
    void setUp() {
        when(mockProvider.getProviderName()).thenReturn("MOCK");
        paymentService = new PaymentService(paymentRepository, orderRepository, customerRepository, orderService, List.of(mockProvider));

        customerId = UUID.randomUUID();
        customer = new Customer();
        customer.setId(customerId);

        order = new Order();
        order.setId("order-1");
        order.setCustomer(customer);
        order.setStatus(OrderStatus.PLACED);
        order.setGrandTotal(new BigDecimal("1000.00"));

        initReq = new PaymentInitiateRequest();
        initReq.setOrderId("order-1");
        initReq.setProvider("MOCK");

        payment = new Payment();
        payment.setId("payment-1");
        payment.setOrder(order);
        payment.setCustomer(customer);
        payment.setStatus(PaymentStatus.PENDING);
        payment.setProvider("MOCK");
        payment.setProviderTransactionId("tx-123");

        verifyReq = new PaymentVerificationRequest();
        verifyReq.setProviderTransactionId("tx-123");
        verifyReq.setProviderStatus("SUCCESS");
    }

    @Test
    void initiatePayment_success_createsPaymentAndSetsStatusPending() {
        when(orderRepository.findByIdAndCustomerId("order-1", customerId)).thenReturn(Optional.of(order));
        when(customerRepository.findById(customerId)).thenReturn(Optional.of(customer));
        when(mockProvider.initiatePayment(any(Order.class), any(Payment.class)))
                .thenReturn(new PaymentProvider.PaymentInitiationResult(true, "tx-123", "url", null));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> i.getArgument(0));

        PaymentResponse res = paymentService.initiatePayment(customerId, initReq);

        assertNotNull(res);
        assertEquals(PaymentStatus.PENDING, res.getStatus());
        assertEquals("tx-123", res.getProviderTransactionId());
    }

    @Test
    void verifyPayment_success_transitionsOrderToConfirmed() {
        when(paymentRepository.findByIdAndCustomerId("payment-1", customerId)).thenReturn(Optional.of(payment));
        when(mockProvider.verifyPayment(any(Payment.class), eq("tx-123"), eq("SUCCESS")))
                .thenReturn(new PaymentProvider.PaymentVerificationResult(true, false, null));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> i.getArgument(0));

        PaymentResponse res = paymentService.verifyPayment("payment-1", customerId, verifyReq);

        assertEquals(PaymentStatus.SUCCESS, res.getStatus());
        verify(orderService).updateOrderStatus("order-1", OrderStatus.CONFIRMED, "SYSTEM", "Payment successful");
    }

    @Test
    void verifyPayment_failed_transitionsOrderToPaymentFailed() {
        verifyReq.setProviderStatus("FAILED");
        when(paymentRepository.findByIdAndCustomerId("payment-1", customerId)).thenReturn(Optional.of(payment));
        when(mockProvider.verifyPayment(any(Payment.class), eq("tx-123"), eq("FAILED")))
                .thenReturn(new PaymentProvider.PaymentVerificationResult(false, false, "Declined"));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> i.getArgument(0));

        PaymentResponse res = paymentService.verifyPayment("payment-1", customerId, verifyReq);

        assertEquals(PaymentStatus.FAILED, res.getStatus());
        assertEquals("Declined", res.getErrorMessage());
        verify(orderService).updateOrderStatus("order-1", OrderStatus.PAYMENT_FAILED, "SYSTEM", "Payment failed");
    }
}
