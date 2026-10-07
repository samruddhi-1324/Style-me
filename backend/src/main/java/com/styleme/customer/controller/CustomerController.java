package com.styleme.customer.controller;

import com.styleme.common.dto.ApiResponse;
import com.styleme.auth.security.UserPrincipal;
import com.styleme.customer.dto.AddressRequest;
import com.styleme.customer.dto.AddressResponse;
import com.styleme.customer.dto.CustomerProfileRequest;
import com.styleme.customer.dto.CustomerResponse;
import com.styleme.customer.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
@Tag(name = "Customer", description = "Customer profile and address management")
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get current customer profile")
    public ResponseEntity<ApiResponse<CustomerResponse>> getProfile(
            @AuthenticationPrincipal UserPrincipal principal) {
        UUID customerId = principal.getId();
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved", customerService.getProfile(customerId)));
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update current customer profile")
    public ResponseEntity<ApiResponse<CustomerResponse>> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CustomerProfileRequest req) {
        UUID customerId = principal.getId();
        return ResponseEntity.ok(ApiResponse.success("Profile updated", customerService.updateProfile(customerId, req)));
    }

    @GetMapping("/me/addresses")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get current customer addresses")
    public ResponseEntity<ApiResponse<List<AddressResponse>>> getAddresses(
            @AuthenticationPrincipal UserPrincipal principal) {
        UUID customerId = principal.getId();
        return ResponseEntity.ok(ApiResponse.success("Addresses retrieved", customerService.getAddresses(customerId)));
    }

    @PostMapping("/me/addresses")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Add a new address")
    public ResponseEntity<ApiResponse<AddressResponse>> addAddress(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AddressRequest req) {
        UUID customerId = principal.getId();
        return ResponseEntity.ok(ApiResponse.success("Address added", customerService.addAddress(customerId, req)));
    }

    @PutMapping("/me/addresses/{addressId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update an address")
    public ResponseEntity<ApiResponse<AddressResponse>> updateAddress(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long addressId, 
            @Valid @RequestBody AddressRequest req) {
        UUID customerId = principal.getId();
        return ResponseEntity.ok(ApiResponse.success("Address updated", customerService.updateAddress(customerId, addressId, req)));
    }

    @DeleteMapping("/me/addresses/{addressId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Delete an address")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long addressId) {
        UUID customerId = principal.getId();
        customerService.deleteAddress(customerId, addressId);
        return ResponseEntity.ok(ApiResponse.success("Address deleted", null));
    }
}
