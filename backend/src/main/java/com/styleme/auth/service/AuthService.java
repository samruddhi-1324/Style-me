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
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

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

    @Transactional
    public AuthResponse loginWithGoogle(Map<String, Object> claims) {
        String googleSubject = requiredGoogleClaim(claims, "sub");
        String email = requiredGoogleClaim(claims, "email").trim().toLowerCase();
        boolean emailVerified = Boolean.parseBoolean(String.valueOf(claims.get("email_verified")));
        if (!emailVerified) {
            throw googleAuthenticationException("GOOGLE_EMAIL_NOT_VERIFIED",
                    "Google must verify the email address before it can be used.");
        }

        User user = userRepository.findByGoogleSubject(googleSubject).orElseGet(() -> {
            if (userRepository.existsByEmail(email)) {
                throw googleAuthenticationException("GOOGLE_ACCOUNT_LINK_REQUIRED",
                        "This email already has an account. Sign in with that account before linking Google.");
            }

            String firstName = claimOrDefault(claims, "given_name");
            String lastName = claimOrDefault(claims, "family_name");
            if (firstName.isBlank()) {
                String fullName = claimOrDefault(claims, "name");
                String[] nameParts = fullName.trim().split("\\s+", 2);
                firstName = nameParts.length == 0 || nameParts[0].isBlank() ? "StyleMe" : nameParts[0];
                lastName = nameParts.length > 1 ? nameParts[1] : "";
            }

            User newUser = new User(
                    email,
                    passwordEncoder.encode(UUID.randomUUID().toString()),
                    limitName(firstName),
                    limitName(lastName)
            );
            newUser.setGoogleSubject(googleSubject);
            newUser.setEmailVerified(true);
            Role customerRole = roleRepository.findByName(RoleEnum.ROLE_CUSTOMER)
                    .orElseGet(() -> roleRepository.save(
                            new Role(RoleEnum.ROLE_CUSTOMER, "Standard registered customer")));
            newUser.addRole(customerRole);
            return userRepository.save(newUser);
        });

        if (!user.isActive()) {
            throw googleAuthenticationException("ACCOUNT_DISABLED", "This account is disabled.");
        }

        UserPrincipal principal = UserPrincipal.create(user);
        String jwt = tokenProvider.generateTokenFromUserPrincipal(principal);
        return new AuthResponse(jwt, tokenProvider.getExpirationMs(), UserResponse.fromEntity(user));
    }

    private String requiredGoogleClaim(Map<String, Object> claims, String name) {
        Object value = claims.get(name);
        if (value == null || value.toString().isBlank()) {
            throw googleAuthenticationException("GOOGLE_PROFILE_INCOMPLETE",
                    "Google did not provide the required account information.");
        }
        return value.toString();
    }

    private String claimOrDefault(Map<String, Object> claims, String name) {
        Object value = claims.get(name);
        return value == null ? "" : value.toString().trim();
    }

    private String limitName(String name) {
        return name.length() <= 100 ? name : name.substring(0, 100);
    }

    private OAuth2AuthenticationException googleAuthenticationException(String code, String message) {
        return new OAuth2AuthenticationException(new OAuth2Error(code), message);
    }
}
