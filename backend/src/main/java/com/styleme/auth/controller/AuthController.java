package com.styleme.auth.controller;

import com.styleme.auth.dto.AuthResponse;
import com.styleme.auth.dto.LoginRequest;
import com.styleme.auth.dto.RegisterRequest;
import com.styleme.auth.security.GoogleOAuth2AuthenticationHandler;
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
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Registration, login, token refresh, and identity APIs")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;
    private final GoogleOAuth2AuthenticationHandler googleOAuth2AuthenticationHandler;

    public AuthController(AuthService authService, UserService userService,
                          GoogleOAuth2AuthenticationHandler googleOAuth2AuthenticationHandler) {
        this.authService = authService;
        this.userService = userService;
        this.googleOAuth2AuthenticationHandler = googleOAuth2AuthenticationHandler;
    }

    @PostMapping("/register")
    @Operation(summary = "Register new customer account", description = "Creates a customer account and establishes an HttpOnly session cookie.")
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse authResponse = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .header(HttpHeaders.SET_COOKIE, googleOAuth2AuthenticationHandler.sessionCookieHeader(authResponse))
                .body(ApiResponse.success("Account registered successfully", authResponse.getUser()));
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user credentials", description = "Authenticates email and password and establishes an HttpOnly session cookie.")
    public ResponseEntity<ApiResponse<UserResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse authResponse = authService.login(request);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, googleOAuth2AuthenticationHandler.sessionCookieHeader(authResponse))
                .body(ApiResponse.success("Authentication successful", authResponse.getUser()));
    }

    @PostMapping("/logout")
    @Operation(summary = "Clear the browser authentication cookie")
    public ResponseEntity<ApiResponse<Void>> logout() {
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, googleOAuth2AuthenticationHandler.expiredCookieHeader())
                .body(ApiResponse.success("Signed out successfully", null));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user identity", description = "Returns the profile details of the user associated with the provided JWT Bearer token.")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        UserResponse userResponse = userService.getUserById(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("User profile retrieved successfully", userResponse));
    }

    @GetMapping("/session")
    @Operation(summary = "Get the current browser session, if one exists")
    public ResponseEntity<ApiResponse<UserResponse>> getSession(
            @AuthenticationPrincipal UserPrincipal principal) {
        UserResponse userResponse = principal == null ? null : userService.getUserById(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Authentication session checked", userResponse));
    }
}
