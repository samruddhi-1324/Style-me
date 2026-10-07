package com.styleme.order.service;

import com.styleme.cart.entity.Cart;
import com.styleme.cart.entity.CartItem;
import com.styleme.cart.repository.CartRepository;
import com.styleme.common.exception.BadRequestException;
import com.styleme.common.exception.ResourceNotFoundException;
import com.styleme.coupon.dto.CouponValidationRequest;
import com.styleme.coupon.dto.CouponValidationResponse;
import com.styleme.coupon.dto.PricingResult;
import com.styleme.coupon.service.CouponService;
import com.styleme.coupon.service.PricingService;
import com.styleme.customer.entity.Customer;
import com.styleme.customer.repository.CustomerRepository;
import com.styleme.inventory.service.InventoryService;
import com.styleme.order.dto.CheckoutRequest;
import com.styleme.order.dto.OrderItemResponse;
import com.styleme.order.dto.OrderResponse;
import com.styleme.order.entity.Order;
import com.styleme.order.entity.OrderItem;
import com.styleme.order.entity.OrderStatus;
import com.styleme.order.entity.OrderStatusHistory;
import com.styleme.order.repository.OrderRepository;
import com.styleme.order.repository.OrderStatusHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Order creation workflow.
 * SRS Section 102: Checkout Validation Sequence (11 steps).
 * SRS Section 103: Order State Integrity.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderStatusHistoryRepository statusHistoryRepository;
    private final CartRepository cartRepository;
    private final CustomerRepository customerRepository;
    private final CouponService couponService;
    private final PricingService pricingService;
    private final InventoryService inventoryService;

    @Transactional
    public OrderResponse checkout(UUID customerId, CheckoutRequest req) {
        log.info("Starting checkout for customer: {}", customerId);

        // 1. Customer validation
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        // 2. Cart validation
        Cart cart = cartRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new BadRequestException("No active cart found"));
        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        // 3-5, 7. Coupon and Pricing validation
        CouponValidationResponse couponResponse = null;
        if (req.getCouponCode() != null && !req.getCouponCode().trim().isEmpty()) {
            CouponValidationRequest couponReq = new CouponValidationRequest();
            couponReq.setCouponCode(req.getCouponCode().trim());
            
            // Extract product and category IDs from cart for coupon validation
            List<String> cartProductIds = cart.getItems().stream()
                    .map(item -> item.getProduct().getId())
                    .collect(Collectors.toList());
            couponReq.setCartProductIds(cartProductIds);
            couponReq.setOrderSubtotal(pricingService.calculate(cart, null).getSubtotal());
            
            couponResponse = couponService.validateCoupon(couponReq, customerId);
        }

        // 11. Final authoritative amount
        PricingResult pricing = pricingService.calculate(cart, req.getCouponCode());

        // Pre-generate order ID for inventory reference
        String orderId = UUID.randomUUID().toString();
        String orderNumber = generateOrderNumber();

        // 6. Inventory reservation
        for (CartItem item : cart.getItems()) {
            String sku = item.getVariant() != null ? item.getVariant().getSku() : item.getProduct().getSku();
            try {
                inventoryService.reserve(sku, item.getQuantity(), orderId, "ORDER");
            } catch (Exception e) {
                log.error("Inventory reservation failed for SKU {}: {}", sku, e.getMessage());
                throw new BadRequestException("Inventory reservation failed: " + e.getMessage());
            }
        }

        // 8-9. Create Order (Address mapped from request)
        Order order = new Order();
        order.setId(orderId);
        order.setOrderNumber(orderNumber);
        order.setCustomer(customer);
        order.setStatus(OrderStatus.PLACED);

        // Pricing snapshots
        order.setSubtotal(pricing.getSubtotal());
        order.setDiscountAmount(pricing.getDiscountAmount());
        order.setCouponCode(req.getCouponCode());
        order.setTaxAmount(pricing.getTaxAmount());
        order.setTaxRate(pricing.getTaxRate());
        order.setShippingAmount(pricing.getShippingAmount());
        order.setGrandTotal(pricing.getGrandTotal());

        // Address snapshots
        order.setShippingName(req.getShippingName());
        order.setShippingPhone(req.getShippingPhone());
        order.setShippingLine1(req.getShippingLine1());
        order.setShippingLine2(req.getShippingLine2());
        order.setShippingCity(req.getShippingCity());
        order.setShippingState(req.getShippingState());
        order.setShippingPostal(req.getShippingPostal());
        order.setShippingCountry(req.getShippingCountry());
        order.setNotes(req.getNotes());

        // Create Order Items
        for (CartItem cItem : cart.getItems()) {
            OrderItem oItem = new OrderItem();
            oItem.setOrder(order);
            oItem.setProductId(cItem.getProduct().getId());
            if (cItem.getVariant() != null) {
                oItem.setVariantId(cItem.getVariant().getId());
                oItem.setVariantName(cItem.getVariant().getColorName());
                oItem.setSku(cItem.getVariant().getSku());
                // Use product price as authoritative for variants
                oItem.setUnitPrice(cItem.getProduct().getPrice());
            } else {
                oItem.setSku(cItem.getProduct().getSku());
                oItem.setUnitPrice(cItem.getProduct().getPrice());
            }
            oItem.setProductName(cItem.getProduct().getName());
            oItem.setQuantity(cItem.getQuantity());
            
            BigDecimal lineTotal = oItem.getUnitPrice().multiply(BigDecimal.valueOf(oItem.getQuantity()));
            oItem.setLineTotal(lineTotal);

            order.getItems().add(oItem);
        }

        order = orderRepository.save(order);

        // Record initial status
        recordStatusHistory(order, null, OrderStatus.PLACED, customer.getUser().getEmail(), "Order placed");

        // Record coupon redemption
        if (couponResponse != null && couponResponse.isValid()) {
            couponService.recordRedemption(req.getCouponCode().trim(), customerId, pricing.getDiscountAmount(), order.getId());
        }

        // Clear Cart
        cart.getItems().clear();
        cartRepository.save(cart);

        log.info("Order created successfully: {}", order.getOrderNumber());
        return toResponse(order);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrder(String id, UUID customerId) {
        Order order = orderRepository.findByIdAndCustomerId(id, customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found or unauthorized"));
        return toResponse(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getCustomerOrders(UUID customerId, Pageable pageable) {
        return orderRepository.findByCustomerIdOrderByPlacedAtDesc(customerId, pageable)
                .map(this::toResponse);
    }

    // =========================================================================
    // ADMIN METHODS
    // =========================================================================

    @Transactional
    public OrderResponse updateOrderStatus(String orderId, OrderStatus newStatus, String adminEmail, String notes) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        OrderStatus oldStatus = order.getStatus();
        
        if (oldStatus == newStatus) {
            return toResponse(order);
        }

        order.setStatus(newStatus);
        order = orderRepository.save(order);

        recordStatusHistory(order, oldStatus, newStatus, adminEmail, notes);
        
        // If cancelled, release inventory reservations
        if (newStatus == OrderStatus.CANCELLED && oldStatus == OrderStatus.PLACED) {
            for (OrderItem item : order.getItems()) {
                inventoryService.release(item.getSku(), item.getQuantity(), order.getId(), "ORDER");
            }
        }
        
        // Deduction of inventory upon payment success (CONFIRMED)
        if (newStatus == OrderStatus.CONFIRMED && oldStatus == OrderStatus.PLACED) {
            for (OrderItem item : order.getItems()) {
                inventoryService.deduct(item.getSku(), item.getQuantity(), order.getId(), "ORDER");
            }
        }

        return toResponse(order);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderAdmin(String id) {
        return orderRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
    }

    // =========================================================================
    // HELPER METHODS
    // =========================================================================

    private String generateOrderNumber() {
        String datePart = java.time.LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomPart = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "SM-" + datePart + "-" + randomPart;
    }

    private void recordStatusHistory(Order order, OrderStatus from, OrderStatus to, String by, String notes) {
        OrderStatusHistory history = new OrderStatusHistory(
                order.getId(),
                from != null ? from.name() : null,
                to.name(),
                by
        );
        history.setNotes(notes);
        statusHistoryRepository.save(history);
    }

    private OrderResponse toResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .customerId(order.getCustomer().getId())
                .status(order.getStatus())
                .subtotal(order.getSubtotal())
                .discountAmount(order.getDiscountAmount())
                .couponCode(order.getCouponCode())
                .taxAmount(order.getTaxAmount())
                .taxRate(order.getTaxRate())
                .shippingAmount(order.getShippingAmount())
                .grandTotal(order.getGrandTotal())
                .shippingName(order.getShippingName())
                .shippingPhone(order.getShippingPhone())
                .shippingLine1(order.getShippingLine1())
                .shippingLine2(order.getShippingLine2())
                .shippingCity(order.getShippingCity())
                .shippingState(order.getShippingState())
                .shippingPostal(order.getShippingPostal())
                .shippingCountry(order.getShippingCountry())
                .notes(order.getNotes())
                .placedAt(order.getPlacedAt())
                .updatedAt(order.getUpdatedAt())
                .items(order.getItems().stream().map(this::toItemResponse).collect(Collectors.toList()))
                .build();
    }

    private OrderItemResponse toItemResponse(OrderItem item) {
        return OrderItemResponse.builder()
                .id(item.getId())
                .productId(item.getProductId())
                .variantId(item.getVariantId())
                .productName(item.getProductName())
                .variantName(item.getVariantName())
                .sku(item.getSku())
                .unitPrice(item.getUnitPrice())
                .quantity(item.getQuantity())
                .lineTotal(item.getLineTotal())
                .build();
    }
}
