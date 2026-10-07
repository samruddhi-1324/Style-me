package com.styleme.wishlist.service;

import com.styleme.customer.entity.Customer;
import com.styleme.customer.service.CustomerService;
import com.styleme.inventory.service.InventoryService;
import com.styleme.product.entity.Product;
import com.styleme.product.repository.ProductRepository;
import com.styleme.user.entity.User;
import com.styleme.wishlist.dto.AddToWishlistRequest;
import com.styleme.wishlist.dto.WishlistResponse;
import com.styleme.wishlist.entity.Wishlist;
import com.styleme.wishlist.entity.WishlistItem;
import com.styleme.wishlist.repository.WishlistRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class WishlistServiceTests {

    private WishlistRepository wishlistRepository;
    private CustomerService customerService;
    private ProductRepository productRepository;
    private InventoryService inventoryService;
    private WishlistService wishlistService;

    @BeforeEach
    void setUp() {
        wishlistRepository = Mockito.mock(WishlistRepository.class);
        customerService = Mockito.mock(CustomerService.class);
        productRepository = Mockito.mock(ProductRepository.class);
        inventoryService = Mockito.mock(InventoryService.class);
        wishlistService = new WishlistService(wishlistRepository, customerService, productRepository, inventoryService);
    }

    @Test
    @DisplayName("addItem: adds product to wishlist without duplicating")
    void testAddItem() {
        UUID customerId = UUID.randomUUID();
        User user = new User();
        Customer customer = new Customer(user);
        customer.setId(customerId);

        Wishlist wishlist = new Wishlist();
        wishlist.setId(UUID.randomUUID());
        wishlist.setCustomer(customer);

        Product product = new Product();
        product.setId("prod-1");
        product.setPrice(new BigDecimal("50.00"));

        when(wishlistRepository.findByCustomerId(customerId)).thenReturn(Optional.of(wishlist));
        when(productRepository.findById("prod-1")).thenReturn(Optional.of(product));
        when(wishlistRepository.save(any(Wishlist.class))).thenAnswer(i -> i.getArgument(0));

        AddToWishlistRequest req = new AddToWishlistRequest();
        req.setProductId("prod-1");

        WishlistResponse res = wishlistService.addItem(customerId, req);

        assertEquals(1, res.getItems().size());
        assertEquals("prod-1", res.getItems().get(0).getProductId());

        // Call again with same product - should not duplicate
        WishlistResponse res2 = wishlistService.addItem(customerId, req);
        assertEquals(1, res2.getItems().size());
    }
}
