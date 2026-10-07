package com.styleme.payment.service;

import com.styleme.common.exception.BadRequestException;
import com.styleme.common.exception.ConflictException;
import com.styleme.common.exception.ResourceNotFoundException;
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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final OrderService orderService;
    private final Map<String, PaymentProvider> providers;

    public PaymentService(
            PaymentRepository paymentRepository,
            OrderRepository orderRepository,
            CustomerRepository customerRepository,
            OrderService orderService,
            List<PaymentProvider> paymentProviders) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.orderService = orderService;
        this.providers = paymentProviders.stream()
                .collect(Collectors.toMap(
                        provider -> provider.getProviderName().toUpperCase(),
                        provider -> provider
                ));
    }

    @Transactional
    public PaymentResponse initiatePayment(UUID customerId, PaymentInitiateRequest req) {
        if (req.getIdempotencyKey() != null) {
            paymentRepository.findByIdempotencyKey(req.getIdempotencyKey()).ifPresent(p -> {
                throw new ConflictException("Payment already initiated with idempotency key: " + req.getIdempotencyKey());
            });
        }

        Order order = orderRepository.findByIdAndCustomerId(req.getOrderId(), customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found or unauthorized"));

        if (order.getStatus() != OrderStatus.PLACED && order.getStatus() != OrderStatus.PAYMENT_FAILED) {
            throw new BadRequestException("Order is in an invalid state for payment: " + order.getStatus());
        }

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        PaymentProvider provider = providers.get(req.getProvider().toUpperCase());
        if (provider == null) {
            throw new BadRequestException("Unsupported payment provider: " + req.getProvider());
        }

        Payment payment = new Payment();
        payment.setId(UUID.randomUUID().toString());
        payment.setOrder(order);
        payment.setCustomer(customer);
        payment.setAmount(order.getGrandTotal());
        payment.setStatus(PaymentStatus.INITIATED);
        payment.setProvider(provider.getProviderName());
        payment.setPaymentMethod(req.getPaymentMethod());
        payment.setIdempotencyKey(req.getIdempotencyKey());
        
        payment = paymentRepository.save(payment);

        PaymentProvider.PaymentInitiationResult result = provider.initiatePayment(order, payment);

        if (result.success()) {
            payment.setProviderTransactionId(result.providerTransactionId());
            payment.setStatus(PaymentStatus.PENDING);
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setErrorMessage(result.errorMessage());
            orderService.updateOrderStatus(order.getId(), OrderStatus.PAYMENT_FAILED, "SYSTEM", "Payment initiation failed");
        }

        payment = paymentRepository.save(payment);
        return toResponse(payment);
    }

    @Transactional
    public PaymentResponse verifyPayment(String paymentId, UUID customerId, PaymentVerificationRequest req) {
        Payment payment = paymentRepository.findByIdAndCustomerId(paymentId, customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found or unauthorized"));

        if (payment.getStatus() == PaymentStatus.SUCCESS || payment.getStatus() == PaymentStatus.FAILED) {
            return toResponse(payment); // Already processed
        }

        PaymentProvider provider = providers.get(payment.getProvider().toUpperCase());
        if (provider == null) {
            throw new BadRequestException("Unsupported payment provider: " + payment.getProvider());
        }

        PaymentProvider.PaymentVerificationResult result = provider.verifyPayment(
                payment, req.getProviderTransactionId(), req.getProviderStatus());

        if (result.success()) {
            payment.setStatus(PaymentStatus.SUCCESS);
            // Deducts inventory and transitions to CONFIRMED
            orderService.updateOrderStatus(payment.getOrder().getId(), OrderStatus.CONFIRMED, "SYSTEM", "Payment successful");
        } else if (!result.isPending()) {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setErrorMessage(req.getErrorMessage() != null ? req.getErrorMessage() : result.errorMessage());
            orderService.updateOrderStatus(payment.getOrder().getId(), OrderStatus.PAYMENT_FAILED, "SYSTEM", "Payment failed");
        }

        payment = paymentRepository.save(payment);
        return toResponse(payment);
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPayment(String paymentId, UUID customerId) {
        Payment payment = paymentRepository.findByIdAndCustomerId(paymentId, customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found or unauthorized"));
        return toResponse(payment);
    }

    private PaymentResponse toResponse(Payment p) {
        return PaymentResponse.builder()
                .id(p.getId())
                .orderId(p.getOrder().getId())
                .customerId(p.getCustomer().getId())
                .amount(p.getAmount())
                .currency(p.getCurrency())
                .status(p.getStatus())
                .provider(p.getProvider())
                .providerTransactionId(p.getProviderTransactionId())
                .paymentMethod(p.getPaymentMethod())
                .errorMessage(p.getErrorMessage())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
