package com.styleme.cart.service;

import com.styleme.cart.dto.AddToCartRequest;
import com.styleme.cart.dto.CartResponse;
import com.styleme.cart.dto.UpdateCartItemRequest;
import com.styleme.cart.entity.Cart;
import com.styleme.cart.entity.CartItem;
import com.styleme.cart.repository.CartRepository;
import com.styleme.customer.entity.Customer;
import com.styleme.customer.service.CustomerService;
import com.styleme.inventory.service.InventoryService;
import com.styleme.product.entity.Product;
import com.styleme.product.repository.ProductRepository;
import com.styleme.product.repository.ProductVariantRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class CartServiceTests {

    private CartRepository cartRepository;
    private CustomerService customerService;
    private ProductRepository productRepository;
    private ProductVariantRepository variantRepository;
    private InventoryService inventoryService;
    private CartService cartService;

    @BeforeEach
    void setUp() {
        cartRepository = Mockito.mock(CartRepository.class);
        customerService = Mockito.mock(CustomerService.class);
        productRepository = Mockito.mock(ProductRepository.class);
        variantRepository = Mockito.mock(ProductVariantRepository.class);
        inventoryService = Mockito.mock(InventoryService.class);
        cartService = new CartService(cartRepository, customerService, productRepository, variantRepository, inventoryService);
    }

    @Test
    @DisplayName("addToCart: guest cart adds item successfully")
    void testAddToCartGuest() {
        String sessionId = "session-123";
        Product product = new Product();
        product.setId("prod-1");
        product.setPrice(new BigDecimal("100.00"));
        
        Cart cart = new Cart();
        cart.setId(UUID.randomUUID());
        cart.setSessionId(sessionId);

        when(cartRepository.findBySessionId(sessionId)).thenReturn(Optional.of(cart));
        when(productRepository.findById("prod-1")).thenReturn(Optional.of(product));
        when(cartRepository.save(any(Cart.class))).thenAnswer(i -> i.getArgument(0));

        AddToCartRequest req = new AddToCartRequest();
        req.setProductId("prod-1");
        req.setQuantity(2);

        CartResponse res = cartService.addToCart(null, sessionId, req);

        assertNotNull(res);
        assertEquals(1, res.getItems().size());
        assertEquals(2, res.getItems().get(0).getQuantity());
        assertEquals(new BigDecimal("200.00"), res.getSubtotal());
    }

    @Test
    @DisplayName("updateItemQuantity: removes item when quantity is 0")
    void testUpdateItemQuantityToZero() {
        String sessionId = "session-123";
        Cart cart = new Cart();
        cart.setId(UUID.randomUUID());
        cart.setSessionId(sessionId);
        
        Product product = new Product();
        product.setId("prod-1");
        product.setPrice(new BigDecimal("100.00"));
        
        CartItem item = new CartItem(cart, product, null, 2);
        item.setId(1L);
        cart.getItems().add(item);

        when(cartRepository.findBySessionId(sessionId)).thenReturn(Optional.of(cart));
        when(cartRepository.save(any(Cart.class))).thenAnswer(i -> i.getArgument(0));

        UpdateCartItemRequest req = new UpdateCartItemRequest();
        req.setQuantity(0);

        CartResponse res = cartService.updateItemQuantity(null, sessionId, 1L, req);

        assertEquals(0, res.getItems().size());
        assertEquals(new BigDecimal("0"), res.getSubtotal());
    }
}
