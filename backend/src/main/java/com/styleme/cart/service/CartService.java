package com.styleme.cart.service;

import com.styleme.cart.dto.AddToCartRequest;
import com.styleme.cart.dto.CartItemResponse;
import com.styleme.cart.dto.CartResponse;
import com.styleme.cart.dto.UpdateCartItemRequest;
import com.styleme.cart.entity.Cart;
import com.styleme.cart.entity.CartItem;
import com.styleme.cart.repository.CartRepository;
import com.styleme.common.exception.ResourceNotFoundException;
import com.styleme.customer.entity.Customer;
import com.styleme.customer.service.CustomerService;
import com.styleme.inventory.service.InventoryService;
import com.styleme.product.entity.Product;
import com.styleme.product.entity.ProductVariant;
import com.styleme.product.repository.ProductRepository;
import com.styleme.product.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CustomerService customerService;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final InventoryService inventoryService;

    @Transactional
    public CartResponse getCart(UUID customerId, String sessionId) {
        return toCartResponse(getOrCreateCart(customerId, sessionId));
    }

    @Transactional
    public CartResponse addToCart(UUID customerId, String sessionId, AddToCartRequest req) {
        Cart cart = getOrCreateCart(customerId, sessionId);

        // Verify product
        Product product = productRepository.findById(req.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        ProductVariant variant = null;
        if (req.getVariantId() != null) {
            variant = variantRepository.findById(req.getVariantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Variant not found"));
        }

        // Check if item already in cart
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(i -> i.getProduct().getId().equals(req.getProductId()) &&
                        (i.getVariant() == null && req.getVariantId() == null ||
                         i.getVariant() != null && i.getVariant().getId().equals(req.getVariantId())))
                .findFirst();

        if (existingItem.isPresent()) {
            existingItem.get().setQuantity(existingItem.get().getQuantity() + req.getQuantity());
        } else {
            CartItem newItem = new CartItem(cart, product, variant, req.getQuantity());
            cart.getItems().add(newItem);
        }

        cart = cartRepository.save(cart);
        return toCartResponse(cart);
    }

    @Transactional
    public CartResponse updateItemQuantity(UUID customerId, String sessionId, Long itemId, UpdateCartItemRequest req) {
        Cart cart = getOrCreateCart(customerId, sessionId);

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (req.getQuantity() == 0) {
            cart.getItems().remove(item);
        } else {
            item.setQuantity(req.getQuantity());
        }

        cart = cartRepository.save(cart);
        return toCartResponse(cart);
    }

    @Transactional
    public CartResponse removeItem(UUID customerId, String sessionId, Long itemId) {
        Cart cart = getOrCreateCart(customerId, sessionId);

        boolean removed = cart.getItems().removeIf(i -> i.getId().equals(itemId));
        if (!removed) {
            throw new ResourceNotFoundException("Cart item not found");
        }

        cart = cartRepository.save(cart);
        return toCartResponse(cart);
    }

    @Transactional
    public void clearCart(UUID customerId, String sessionId) {
        Cart cart = getOrCreateCart(customerId, sessionId);
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    @Transactional
    public void mergeCarts(String sessionId, UUID customerId) {
        if (sessionId == null || customerId == null) return;

        Optional<Cart> guestCartOpt = cartRepository.findBySessionId(sessionId);
        if (guestCartOpt.isEmpty() || guestCartOpt.get().getItems().isEmpty()) return;

        Cart guestCart = guestCartOpt.get();
        Cart customerCart = getOrCreateCart(customerId, null);

        for (CartItem guestItem : guestCart.getItems()) {
            AddToCartRequest req = new AddToCartRequest();
            req.setProductId(guestItem.getProduct().getId());
            if (guestItem.getVariant() != null) {
                req.setVariantId(guestItem.getVariant().getId());
            }
            req.setQuantity(guestItem.getQuantity());
            
            // Re-use logic to add/update
            addToCart(customerId, null, req);
        }

        guestCart.getItems().clear();
        cartRepository.delete(guestCart);
    }

    private Cart getOrCreateCart(UUID customerId, String sessionId) {
        if (customerId != null) {
            return cartRepository.findByCustomerId(customerId).orElseGet(() -> {
                Cart cart = new Cart();
                Customer customer = customerService.getOrCreateCustomer(customerId);
                cart.setCustomer(customer);
                return cartRepository.save(cart);
            });
        } else if (sessionId != null) {
            return cartRepository.findBySessionId(sessionId).orElseGet(() -> {
                Cart cart = new Cart();
                cart.setSessionId(sessionId);
                return cartRepository.save(cart);
            });
        } else {
            throw new IllegalArgumentException("Either customerId or sessionId must be provided");
        }
    }

    private CartResponse toCartResponse(Cart cart) {
        List<CartItemResponse> items = cart.getItems().stream()
                .map(this::toCartItemResponse)
                .collect(Collectors.toList());

        BigDecimal subtotal = items.stream()
                .map(CartItemResponse::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
                .id(cart.getId())
                .customerId(cart.getCustomer() != null ? cart.getCustomer().getId() : null)
                .sessionId(cart.getSessionId())
                .items(items)
                .subtotal(subtotal)
                .build();
    }

    private CartItemResponse toCartItemResponse(CartItem item) {
        BigDecimal price = item.getProduct().getPrice(); // TODO: Variant pricing overrides later
        return CartItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .variantId(item.getVariant() != null ? item.getVariant().getId() : null)
                .name(item.getProduct().getName())
                .sku(item.getVariant() != null ? item.getVariant().getSku() : item.getProduct().getSku())
                .imageUrl(item.getProduct().getImages().stream().findFirst().map(img -> img.getImageUrl()).orElse(null))
                .price(price)
                .quantity(item.getQuantity())
                .lineTotal(price.multiply(BigDecimal.valueOf(item.getQuantity())))
                .build();
    }
}
