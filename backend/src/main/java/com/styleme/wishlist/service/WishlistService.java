package com.styleme.wishlist.service;

import com.styleme.common.exception.ResourceNotFoundException;
import com.styleme.customer.entity.Customer;
import com.styleme.customer.service.CustomerService;
import com.styleme.inventory.service.InventoryService;
import com.styleme.product.entity.Product;
import com.styleme.product.repository.ProductRepository;
import com.styleme.wishlist.dto.AddToWishlistRequest;
import com.styleme.wishlist.dto.WishlistItemResponse;
import com.styleme.wishlist.dto.WishlistResponse;
import com.styleme.wishlist.entity.Wishlist;
import com.styleme.wishlist.entity.WishlistItem;
import com.styleme.wishlist.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final CustomerService customerService;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;

    @Transactional
    public WishlistResponse getWishlist(UUID customerId) {
        return toWishlistResponse(getOrCreateWishlist(customerId));
    }

    @Transactional
    public WishlistResponse addItem(UUID customerId, AddToWishlistRequest req) {
        Wishlist wishlist = getOrCreateWishlist(customerId);

        Product product = productRepository.findById(req.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        boolean exists = wishlist.getItems().stream()
                .anyMatch(i -> i.getProduct().getId().equals(req.getProductId()));

        if (!exists) {
            wishlist.getItems().add(new WishlistItem(wishlist, product));
            wishlist = wishlistRepository.save(wishlist);
        }

        return toWishlistResponse(wishlist);
    }

    @Transactional
    public WishlistResponse removeItem(UUID customerId, Long itemId) {
        Wishlist wishlist = getOrCreateWishlist(customerId);

        boolean removed = wishlist.getItems().removeIf(i -> i.getId().equals(itemId));
        if (!removed) {
            throw new ResourceNotFoundException("Wishlist item not found");
        }

        wishlist = wishlistRepository.save(wishlist);
        return toWishlistResponse(wishlist);
    }

    private Wishlist getOrCreateWishlist(UUID customerId) {
        return wishlistRepository.findByCustomerId(customerId).orElseGet(() -> {
            Wishlist wishlist = new Wishlist();
            Customer customer = customerService.getOrCreateCustomer(customerId);
            wishlist.setCustomer(customer);
            return wishlistRepository.save(wishlist);
        });
    }

    private WishlistResponse toWishlistResponse(Wishlist wishlist) {
        return WishlistResponse.builder()
                .id(wishlist.getId())
                .customerId(wishlist.getCustomer().getId())
                .items(wishlist.getItems().stream().map(this::toWishlistItemResponse).collect(Collectors.toList()))
                .build();
    }

    private WishlistItemResponse toWishlistItemResponse(WishlistItem item) {
        Product product = item.getProduct();
        boolean inStock = true; // In a real scenario, this would aggregate variant availability
        
        return WishlistItemResponse.builder()
                .id(item.getId())
                .productId(product.getId())
                .name(product.getName())
                .sku(product.getSku())
                .imageUrl(product.getImages().stream().findFirst().map(img -> img.getImageUrl()).orElse(null))
                .price(product.getPrice())
                .inStock(inStock)
                .addedAt(item.getAddedAt())
                .build();
    }
}
