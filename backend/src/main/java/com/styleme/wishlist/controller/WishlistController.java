package com.styleme.wishlist.controller;

import com.styleme.common.dto.ApiResponse;
import com.styleme.auth.security.UserPrincipal;
import com.styleme.wishlist.dto.AddToWishlistRequest;
import com.styleme.wishlist.dto.WishlistResponse;
import com.styleme.wishlist.service.WishlistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/wishlist")
@RequiredArgsConstructor
@Tag(name = "Wishlist", description = "Customer wishlist management")
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get current customer's wishlist")
    public ResponseEntity<ApiResponse<WishlistResponse>> getWishlist(
            @AuthenticationPrincipal UserPrincipal principal) {
        UUID customerId = principal.getId();
        return ResponseEntity.ok(ApiResponse.success("Wishlist retrieved", wishlistService.getWishlist(customerId)));
    }

    @PostMapping("/items")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Add item to wishlist")
    public ResponseEntity<ApiResponse<WishlistResponse>> addItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AddToWishlistRequest req) {
        UUID customerId = principal.getId();
        return ResponseEntity.ok(ApiResponse.success("Item added to wishlist", wishlistService.addItem(customerId, req)));
    }

    @DeleteMapping("/items/{itemId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Remove item from wishlist")
    public ResponseEntity<ApiResponse<WishlistResponse>> removeItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long itemId) {
        UUID customerId = principal.getId();
        return ResponseEntity.ok(ApiResponse.success("Item removed from wishlist", wishlistService.removeItem(customerId, itemId)));
    }
}
