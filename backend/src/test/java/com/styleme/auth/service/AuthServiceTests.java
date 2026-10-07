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
import java.util.Map;

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

    @Test
    @DisplayName("Google sign-in creates a verified customer linked to Google's stable subject")
    void testGoogleLoginCreatesUser() {
        Map<String, Object> claims = Map.of(
                "sub", "google-subject-123",
                "email", "Google.User@example.com",
                "email_verified", true,
                "given_name", "Google",
                "family_name", "User"
        );
        Role customerRole = new Role(RoleEnum.ROLE_CUSTOMER, "Customer");
        User savedUser = new User("google.user@example.com", "encoded-random-password", "Google", "User");
        savedUser.setId(UUID.randomUUID());
        savedUser.setGoogleSubject("google-subject-123");
        savedUser.setEmailVerified(true);
        savedUser.addRole(customerRole);

        when(userRepository.findByGoogleSubject("google-subject-123")).thenReturn(Optional.empty());
        when(userRepository.existsByEmail("google.user@example.com")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded-random-password");
        when(roleRepository.findByName(RoleEnum.ROLE_CUSTOMER)).thenReturn(Optional.of(customerRole));
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(tokenProvider.generateTokenFromUserPrincipal(any(UserPrincipal.class))).thenReturn("google-jwt");
        when(tokenProvider.getExpirationMs()).thenReturn(3600000L);

        AuthResponse response = authService.loginWithGoogle(claims);

        assertEquals("google-jwt", response.getAccessToken());
        assertEquals("google.user@example.com", response.getUser().getEmail());
        assertTrue(response.getUser().isEmailVerified());
        verify(userRepository).save(argThat(user ->
                user.getGoogleSubject().equals("google-subject-123")
                        && user.isEmailVerified()
                        && user.getRoles().contains(customerRole)));
    }

    @Test
    @DisplayName("Google sign-in does not silently link an existing email account")
    void testGoogleLoginRejectsUnlinkedExistingEmail() {
        when(userRepository.findByGoogleSubject("google-subject-123")).thenReturn(Optional.empty());
        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        var exception = assertThrows(org.springframework.security.oauth2.core.OAuth2AuthenticationException.class,
                () -> authService.loginWithGoogle(Map.of(
                        "sub", "google-subject-123",
                        "email", "existing@example.com",
                        "email_verified", true
                )));

        assertEquals("GOOGLE_ACCOUNT_LINK_REQUIRED", exception.getError().getErrorCode());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Google sign-in rejects an unverified email")
    void testGoogleLoginRejectsUnverifiedEmail() {
        var exception = assertThrows(org.springframework.security.oauth2.core.OAuth2AuthenticationException.class,
                () -> authService.loginWithGoogle(Map.of(
                        "sub", "google-subject-123",
                        "email", "unverified@example.com",
                        "email_verified", false
                )));

        assertEquals("GOOGLE_EMAIL_NOT_VERIFIED", exception.getError().getErrorCode());
        verify(userRepository, never()).save(any(User.class));
    }
}
