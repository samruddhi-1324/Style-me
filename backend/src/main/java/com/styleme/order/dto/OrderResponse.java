package com.styleme.order.dto;

import com.styleme.order.entity.OrderStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class OrderResponse {
    private String id;
    private String orderNumber;
    private UUID customerId;
    private OrderStatus status;

    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private String couponCode;
    private BigDecimal taxAmount;
    private BigDecimal taxRate;
    private BigDecimal shippingAmount;
    private BigDecimal grandTotal;

    private String shippingName;
    private String shippingPhone;
    private String shippingLine1;
    private String shippingLine2;
    private String shippingCity;
    private String shippingState;
    private String shippingPostal;
    private String shippingCountry;
    private String notes;

    private Instant placedAt;
    private Instant updatedAt;

    private List<OrderItemResponse> items;
}
