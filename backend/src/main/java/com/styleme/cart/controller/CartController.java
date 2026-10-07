package com.styleme.cart.controller;

import com.styleme.cart.dto.AddToCartRequest;
import com.styleme.cart.dto.CartResponse;
import com.styleme.cart.dto.UpdateCartItemRequest;
import com.styleme.cart.service.CartService;
import com.styleme.auth.security.UserPrincipal;
import com.styleme.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
@Tag(name = "Cart", description = "Shopping cart management")
public class CartController {

    private final CartService cartService;

    private UUID getCustomerId(UserPrincipal principal) {
        return principal != null ? principal.getId() : null;
    }

    @GetMapping
    @Operation(summary = "Get current cart")
    public ResponseEntity<ApiResponse<CartResponse>> getCart(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestHeader(value = "X-Session-ID", required = false) String sessionId) {
        
        UUID customerId = getCustomerId(principal);
        return ResponseEntity.ok(ApiResponse.success("Cart retrieved", cartService.getCart(customerId, sessionId)));
    }

    @PostMapping("/items")
    @Operation(summary = "Add item to cart")
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestHeader(value = "X-Session-ID", required = false) String sessionId,
            @Valid @RequestBody AddToCartRequest req) {
        
        UUID customerId = getCustomerId(principal);
        return ResponseEntity.ok(ApiResponse.success("Item added to cart", cartService.addToCart(customerId, sessionId, req)));
    }

    @PutMapping("/items/{itemId}")
    @Operation(summary = "Update cart item quantity")
    public ResponseEntity<ApiResponse<CartResponse>> updateItemQuantity(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestHeader(value = "X-Session-ID", required = false) String sessionId,
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateCartItemRequest req) {
        
        UUID customerId = getCustomerId(principal);
        return ResponseEntity.ok(ApiResponse.success("Cart updated", cartService.updateItemQuantity(customerId, sessionId, itemId, req)));
    }

    @DeleteMapping("/items/{itemId}")
    @Operation(summary = "Remove item from cart")
    public ResponseEntity<ApiResponse<CartResponse>> removeItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestHeader(value = "X-Session-ID", required = false) String sessionId,
            @PathVariable Long itemId) {
        
        UUID customerId = getCustomerId(principal);
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart", cartService.removeItem(customerId, sessionId, itemId)));
    }

    @DeleteMapping
    @Operation(summary = "Clear cart")
    public ResponseEntity<ApiResponse<Void>> clearCart(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestHeader(value = "X-Session-ID", required = false) String sessionId) {
        
        UUID customerId = getCustomerId(principal);
        cartService.clearCart(customerId, sessionId);
        return ResponseEntity.ok(ApiResponse.success("Cart cleared", null));
    }

    @PostMapping("/merge")
    @Operation(summary = "Merge guest cart into customer cart")
    public ResponseEntity<ApiResponse<Void>> mergeCarts(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestHeader(value = "X-Session-ID", required = false) String sessionId) {
        
        UUID customerId = getCustomerId(principal);
        cartService.mergeCarts(sessionId, customerId);
        return ResponseEntity.ok(ApiResponse.success("Carts merged", null));
    }
}
