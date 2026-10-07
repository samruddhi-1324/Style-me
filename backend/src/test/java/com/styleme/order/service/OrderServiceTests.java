package com.styleme.order.service;

import com.styleme.cart.entity.Cart;
import com.styleme.cart.entity.CartItem;
import com.styleme.cart.repository.CartRepository;
import com.styleme.common.exception.BadRequestException;
import com.styleme.coupon.dto.CouponValidationRequest;
import com.styleme.coupon.dto.CouponValidationResponse;
import com.styleme.coupon.dto.PricingResult;
import com.styleme.coupon.service.CouponService;
import com.styleme.coupon.service.PricingService;
import com.styleme.customer.entity.Customer;
import com.styleme.customer.repository.CustomerRepository;
import com.styleme.inventory.service.InventoryService;
import com.styleme.order.dto.CheckoutRequest;
import com.styleme.order.dto.OrderResponse;
import com.styleme.order.entity.Order;
import com.styleme.order.entity.OrderStatus;
import com.styleme.order.repository.OrderRepository;
import com.styleme.order.repository.OrderStatusHistoryRepository;
import com.styleme.product.entity.Product;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class OrderServiceTests {

    @Mock private OrderRepository orderRepository;
    @Mock private OrderStatusHistoryRepository statusHistoryRepository;
    @Mock private CartRepository cartRepository;
    @Mock private CustomerRepository customerRepository;
    @Mock private CouponService couponService;
    @Mock private PricingService pricingService;
    @Mock private InventoryService inventoryService;

    @InjectMocks private OrderService orderService;

    private UUID customerId;
    private Customer customer;
    private Cart cart;
    private CheckoutRequest checkoutReq;
    private PricingResult pricingResult;

    @BeforeEach
    void setUp() {
        customerId = UUID.randomUUID();
        customer = new Customer();
        customer.setUser(new com.styleme.user.entity.User());
        customer.getUser().setEmail("test@example.com");

        Product p = new Product();
        p.setId("p1");
        p.setSku("SKU-123");
        p.setPrice(new BigDecimal("1000.00"));
        p.setName("Sunglasses");

        CartItem item = new CartItem();
        item.setProduct(p);
        item.setQuantity(2);

        cart = new Cart();
        cart.setId(UUID.randomUUID());
        cart.setCustomer(customer);
        cart.setItems(new ArrayList<>(List.of(item)));

        checkoutReq = new CheckoutRequest();
        checkoutReq.setShippingName("John Doe");
        checkoutReq.setShippingLine1("123 Street");
        checkoutReq.setShippingCity("City");
        checkoutReq.setShippingState("State");
        checkoutReq.setShippingPostal("12345");
        checkoutReq.setShippingCountry("Country");

        pricingResult = new PricingResult();
        pricingResult.setSubtotal(new BigDecimal("2000.00"));
        pricingResult.setDiscountAmount(BigDecimal.ZERO);
        pricingResult.setTaxAmount(new BigDecimal("360.00"));
        pricingResult.setTaxRate(new BigDecimal("0.18"));
        pricingResult.setShippingAmount(BigDecimal.ZERO);
        pricingResult.setGrandTotal(new BigDecimal("2360.00"));
    }

    @Test
    void checkout_happyPath_createsOrderAndReservesInventory() {
        when(customerRepository.findById(customerId)).thenReturn(Optional.of(customer));
        when(cartRepository.findByCustomerId(customerId)).thenReturn(Optional.of(cart));
        when(pricingService.calculate(eq(cart), eq(null))).thenReturn(pricingResult);
        
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> {
            Order o = i.getArgument(0);
            return o;
        });

        OrderResponse res = orderService.checkout(customerId, checkoutReq);

        assertNotNull(res);
        assertEquals(OrderStatus.PLACED, res.getStatus());
        assertEquals(new BigDecimal("2360.00"), res.getGrandTotal());

        // Inventory reserved for SKU-123 qty 2
        verify(inventoryService).reserve(eq("SKU-123"), eq(2), anyString(), eq("ORDER"));
        
        // Cart cleared
        assertTrue(cart.getItems().isEmpty());
        verify(cartRepository).save(cart);

        // Status history saved
        verify(statusHistoryRepository).save(any());
    }

    @Test
    void checkout_insufficientInventory_throwsExceptionAndRollsBack() {
        when(customerRepository.findById(customerId)).thenReturn(Optional.of(customer));
        when(cartRepository.findByCustomerId(customerId)).thenReturn(Optional.of(cart));
        when(pricingService.calculate(eq(cart), eq(null))).thenReturn(pricingResult);
        
        doThrow(new BadRequestException("Insufficient stock"))
            .when(inventoryService).reserve(anyString(), anyInt(), anyString(), anyString());

        assertThrows(BadRequestException.class, () -> orderService.checkout(customerId, checkoutReq));

        // Order not saved
        verify(orderRepository, never()).save(any());
        // Cart not cleared
        assertFalse(cart.getItems().isEmpty());
    }

    @Test
    void checkout_withExpiredCoupon_throwsException() {
        checkoutReq.setCouponCode("SUMMER20");
        when(customerRepository.findById(customerId)).thenReturn(Optional.of(customer));
        when(cartRepository.findByCustomerId(customerId)).thenReturn(Optional.of(cart));
        when(pricingService.calculate(eq(cart), eq(null))).thenReturn(pricingResult);
        
        doThrow(new BadRequestException("Coupon is expired"))
            .when(couponService).validateCoupon(any(CouponValidationRequest.class), eq(customerId));

        assertThrows(BadRequestException.class, () -> orderService.checkout(customerId, checkoutReq));
        ArgumentCaptor<CouponValidationRequest> requestCaptor =
                ArgumentCaptor.forClass(CouponValidationRequest.class);
        verify(couponService).validateCoupon(requestCaptor.capture(), eq(customerId));
        assertEquals(new BigDecimal("2000.00"), requestCaptor.getValue().getOrderSubtotal());
        
        verify(inventoryService, never()).reserve(anyString(), anyInt(), anyString(), anyString());
        verify(orderRepository, never()).save(any());
    }
}
