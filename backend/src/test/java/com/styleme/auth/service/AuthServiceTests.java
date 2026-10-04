package com.styleme.auth.service;

import com.styleme.auth.dto.AuthResponse;
import com.styleme.auth.dto.LoginRequest;
import com.styleme.auth.dto.RegisterRequest;
import com.styleme.auth.security.JwtTokenProvider;
import com.styleme.auth.security.UserPrincipal;
import com.styleme.common.exception.ConflictException;
import com.styleme.user.entity.Role;
import com.styleme.user.entity.RoleEnum;
import com.styleme.user.entity.User;
import com.styleme.user.repository.RoleRepository;
import com.styleme.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AuthServiceTests {

    private UserRepository userRepository;
    private RoleRepository roleRepository;
    private PasswordEncoder passwordEncoder;
    private AuthenticationManager authenticationManager;
    private JwtTokenProvider tokenProvider;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        userRepository = Mockito.mock(UserRepository.class);
        roleRepository = Mockito.mock(RoleRepository.class);
        passwordEncoder = Mockito.mock(PasswordEncoder.class);
        authenticationManager = Mockito.mock(AuthenticationManager.class);
        tokenProvider = Mockito.mock(JwtTokenProvider.class);

        authService = new AuthService(
                userRepository,
                roleRepository,
                passwordEncoder,
                authenticationManager,
                tokenProvider
        );
    }

    @Test
    @DisplayName("register successfully saves new user with hashed password and role")
    void testRegisterSuccess() {
        RegisterRequest request = new RegisterRequest("newuser@example.com", "SecurePass123", "Alice", "Smith");

        when(userRepository.existsByEmail("newuser@example.com")).thenReturn(false);
        when(passwordEncoder.encode("SecurePass123")).thenReturn("encodedPasswordHash");

        Role customerRole = new Role(RoleEnum.ROLE_CUSTOMER, "Standard registered customer");
        when(roleRepository.findByName(RoleEnum.ROLE_CUSTOMER)).thenReturn(Optional.of(customerRole));

        User savedUser = new User("newuser@example.com", "encodedPasswordHash", "Alice", "Smith");
        savedUser.setId(UUID.randomUUID());
        savedUser.addRole(customerRole);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        when(tokenProvider.generateTokenFromUserPrincipal(any(UserPrincipal.class))).thenReturn("mock-jwt-token");
        when(tokenProvider.getExpirationMs()).thenReturn(86400000L);

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("mock-jwt-token", response.getAccessToken());
        assertEquals("newuser@example.com", response.getUser().getEmail());
        assertEquals("Alice", response.getUser().getFirstName());
        assertTrue(response.getUser().getRoles().contains("ROLE_CUSTOMER"));

        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("register throws ConflictException when email is already registered")
    void testRegisterDuplicateEmail() {
        RegisterRequest request = new RegisterRequest("existing@example.com", "SecurePass123", "Bob", "Jones");
        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        ConflictException ex = assertThrows(ConflictException.class, () -> authService.register(request));
        assertEquals("EMAIL_ALREADY_EXISTS", ex.getErrorCode());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("login successfully authenticates and returns JWT token")
    void testLoginSuccess() {
        LoginRequest request = new LoginRequest("user@example.com", "Password123");

        User user = new User("user@example.com", "encodedPassword", "Carol", "White");
        user.setId(UUID.randomUUID());
        UserPrincipal principal = UserPrincipal.create(user);

        Authentication auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(tokenProvider.generateToken(auth)).thenReturn("mock-login-token");
        when(tokenProvider.getExpirationMs()).thenReturn(86400000L);
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mock-login-token", response.getAccessToken());
        assertEquals("user@example.com", response.getUser().getEmail());
    }

    @Test
    @DisplayName("login throws BadCredentialsException on invalid credentials")
    void testLoginInvalidCredentials() {
        LoginRequest request = new LoginRequest("user@example.com", "WrongPassword");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThrows(BadCredentialsException.class, () -> authService.login(request));
    }
}
