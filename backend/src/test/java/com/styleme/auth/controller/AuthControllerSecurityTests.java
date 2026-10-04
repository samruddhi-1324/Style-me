package com.styleme.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.styleme.auth.dto.LoginRequest;
import com.styleme.auth.dto.RegisterRequest;
import com.styleme.auth.security.JwtTokenProvider;
import com.styleme.auth.security.UserPrincipal;
import com.styleme.user.entity.Role;
import com.styleme.user.entity.RoleEnum;
import com.styleme.user.entity.User;
import com.styleme.user.repository.RoleRepository;
import com.styleme.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerSecurityTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    private Role customerRole;
    private Role adminRole;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        roleRepository.deleteAll();

        customerRole = roleRepository.save(new Role(RoleEnum.ROLE_CUSTOMER, "Customer"));
        adminRole = roleRepository.save(new Role(RoleEnum.ROLE_ADMIN, "Admin"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/register creates user and returns 201 with JWT")
    void testRegisterSuccess() throws Exception {
        RegisterRequest request = new RegisterRequest("john@example.com", "Password123", "John", "Doe");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.data.user.email").value("john@example.com"))
                .andExpect(jsonPath("$.data.user.firstName").value("John"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/register with invalid email or weak password returns 400 Bad Request")
    void testRegisterValidationFailure() throws Exception {
        // Password too short and no number
        RegisterRequest request = new RegisterRequest("invalid-email", "short", "", "");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.errors").isArray());
    }

    @Test
    @DisplayName("POST /api/v1/auth/login with valid credentials returns 200 OK and JWT token")
    void testLoginSuccess() throws Exception {
        User user = new User("sarah@example.com", passwordEncoder.encode("Password123"), "Sarah", "Connor");
        user.addRole(customerRole);
        userRepository.save(user);

        LoginRequest request = new LoginRequest("sarah@example.com", "Password123");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.user.email").value("sarah@example.com"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login with wrong password returns 401 Unauthorized with RFC 7807 ErrorResponse")
    void testLoginWrongPassword() throws Exception {
        User user = new User("sarah@example.com", passwordEncoder.encode("Password123"), "Sarah", "Connor");
        user.addRole(customerRole);
        userRepository.save(user);

        LoginRequest request = new LoginRequest("sarah@example.com", "WrongPassword");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("UNAUTHORIZED"))
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @DisplayName("GET /api/v1/auth/me without token returns 401 Unauthorized")
    void testGetCurrentUserUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @DisplayName("GET /api/v1/auth/me with valid Bearer token returns 200 OK and User profile")
    void testGetCurrentUserAuthorized() throws Exception {
        User user = new User("authuser@example.com", passwordEncoder.encode("Password123"), "Auth", "User");
        user.addRole(customerRole);
        User savedUser = userRepository.save(user);

        UserPrincipal principal = UserPrincipal.create(savedUser);
        String token = tokenProvider.generateTokenFromUserPrincipal(principal);

        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("authuser@example.com"))
                .andExpect(jsonPath("$.data.firstName").value("Auth"));
    }

    @Test
    @DisplayName("GET /api/v1/admin/dashboard with Customer token returns 403 Forbidden")
    void testAdminEndpointForbiddenForCustomer() throws Exception {
        User user = new User("customer@example.com", passwordEncoder.encode("Password123"), "Normal", "Customer");
        user.addRole(customerRole);
        User savedUser = userRepository.save(user);

        UserPrincipal principal = UserPrincipal.create(savedUser);
        String token = tokenProvider.generateTokenFromUserPrincipal(principal);

        mockMvc.perform(get("/api/v1/admin/dashboard")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.error").value("FORBIDDEN"));
    }

    @Test
    @DisplayName("GET /api/v1/admin/dashboard with Admin token returns 200 OK")
    void testAdminEndpointAuthorizedForAdmin() throws Exception {
        User admin = new User("admin@example.com", passwordEncoder.encode("Password123"), "Super", "Admin");
        admin.addRole(adminRole);
        User savedAdmin = userRepository.save(admin);

        UserPrincipal principal = UserPrincipal.create(savedAdmin);
        String token = tokenProvider.generateTokenFromUserPrincipal(principal);

        mockMvc.perform(get("/api/v1/admin/dashboard")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.systemStatus").value("HEALTHY"));
    }
}
