package com.styleme.auth.service;

import com.styleme.auth.dto.AuthResponse;
import com.styleme.auth.dto.LoginRequest;
import com.styleme.auth.dto.RegisterRequest;
import com.styleme.auth.security.JwtTokenProvider;
import com.styleme.auth.security.UserPrincipal;
import com.styleme.common.exception.ConflictException;
import com.styleme.common.exception.ResourceNotFoundException;
import com.styleme.user.dto.UserResponse;
import com.styleme.user.entity.Role;
import com.styleme.user.entity.RoleEnum;
import com.styleme.user.entity.User;
import com.styleme.user.repository.RoleRepository;
import com.styleme.user.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ConflictException("An account with email " + normalizedEmail + " already exists", "EMAIL_ALREADY_EXISTS");
        }

        User user = new User(
                normalizedEmail,
                passwordEncoder.encode(request.getPassword()),
                request.getFirstName().trim(),
                request.getLastName().trim()
        );

        if (request.getPhoneNumber() != null && !request.getPhoneNumber().isBlank()) {
            user.setPhoneNumber(request.getPhoneNumber().trim());
        }

        // Assign default customer role
        Role customerRole = roleRepository.findByName(RoleEnum.ROLE_CUSTOMER)
                .orElseGet(() -> roleRepository.save(new Role(RoleEnum.ROLE_CUSTOMER, "Standard registered customer")));
        user.addRole(customerRole);

        User savedUser = userRepository.save(user);
        UserPrincipal userPrincipal = UserPrincipal.create(savedUser);

        String jwt = tokenProvider.generateTokenFromUserPrincipal(userPrincipal);
        return new AuthResponse(jwt, tokenProvider.getExpirationMs(), UserResponse.fromEntity(savedUser));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword())
        );

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + normalizedEmail));

        return new AuthResponse(jwt, tokenProvider.getExpirationMs(), UserResponse.fromEntity(user));
    }
}
