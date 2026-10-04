package com.styleme.auth.controller;

import com.styleme.auth.dto.AuthResponse;
import com.styleme.auth.dto.LoginRequest;
import com.styleme.auth.dto.RegisterRequest;
import com.styleme.auth.security.UserPrincipal;
import com.styleme.auth.service.AuthService;
import com.styleme.common.dto.ApiResponse;
import com.styleme.user.dto.UserResponse;
import com.styleme.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Registration, login, token refresh, and identity APIs")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    public AuthController(AuthService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register new customer account", description = "Creates a new customer account with default ROLE_CUSTOMER and returns a signed JWT token.")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse authResponse = authService.register(request);
        return new ResponseEntity<>(
                ApiResponse.success("Account registered successfully", authResponse),
                HttpStatus.CREATED
        );
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user credentials", description = "Authenticates email and password, returning an authoritative JWT token.")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse authResponse = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Authentication successful", authResponse));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user identity", description = "Returns the profile details of the user associated with the provided JWT Bearer token.")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        UserResponse userResponse = userService.getUserById(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("User profile retrieved successfully", userResponse));
    }
}
