package com.styleme.common.config;

import com.styleme.auth.security.CustomAccessDeniedHandler;
import com.styleme.auth.security.GoogleOAuth2AuthenticationHandler;
import com.styleme.auth.security.JwtAuthenticationEntryPoint;
import com.styleme.auth.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final CorsConfigurationSource corsConfigurationSource;
    private final JwtAuthenticationEntryPoint unauthorizedHandler;
    private final CustomAccessDeniedHandler accessDeniedHandler;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final GoogleOAuth2AuthenticationHandler googleOAuth2AuthenticationHandler;
    private final ObjectProvider<OAuth2AuthorizationRequestResolver> authorizationRequestResolverProvider;
    private final boolean googleOAuthEnabled;
    private final boolean csrfEnabled;
    private final boolean secureCookiesEnabled;
    private final String csrfCookieSameSite;

    public SecurityConfig(CorsConfigurationSource corsConfigurationSource,
                          JwtAuthenticationEntryPoint unauthorizedHandler,
                          CustomAccessDeniedHandler accessDeniedHandler,
                          JwtAuthenticationFilter jwtAuthenticationFilter,
                          GoogleOAuth2AuthenticationHandler googleOAuth2AuthenticationHandler,
                          ObjectProvider<OAuth2AuthorizationRequestResolver> authorizationRequestResolverProvider,
                          @Value("${app.oauth2.google.enabled:false}") boolean googleOAuthEnabled,
                          @Value("${app.security.csrf-enabled:false}") boolean csrfEnabled,
                          @Value("${app.auth-cookie.secure:false}") boolean secureCookiesEnabled,
                          @Value("${app.auth-cookie.same-site:Lax}") String csrfCookieSameSite) {
        this.corsConfigurationSource = corsConfigurationSource;
        this.unauthorizedHandler = unauthorizedHandler;
        this.accessDeniedHandler = accessDeniedHandler;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.googleOAuth2AuthenticationHandler = googleOAuth2AuthenticationHandler;
        this.authorizationRequestResolverProvider = authorizationRequestResolverProvider;
        this.googleOAuthEnabled = googleOAuthEnabled;
        this.csrfEnabled = csrfEnabled;
        this.secureCookiesEnabled = secureCookiesEnabled;
        this.csrfCookieSameSite = csrfCookieSameSite;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(csrf -> {
                    if (csrfEnabled) {
                        csrf.csrfTokenRepository(csrfTokenRepository())
                                .csrfTokenRequestHandler(new SpaCsrfTokenRequestHandler());
                    } else {
                        csrf.disable();
                    }
                })
                .headers(headers -> headers
                        .httpStrictTransportSecurity(hsts -> hsts
                                .includeSubDomains(true)
                                .preload(true)
                                .maxAgeInSeconds(31536000))
                        .contentSecurityPolicy(csp -> csp
                                .policyDirectives("default-src 'self'; frame-ancestors 'none'; object-src 'none'"))
                        .frameOptions(frame -> frame.deny())
                        .referrerPolicy(referrer -> referrer.policy(org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy.NO_REFERRER))
                        .permissionsPolicy(policy -> policy.policy("camera=(), microphone=(), geolocation=()"))
                )
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(unauthorizedHandler)
                        .accessDeniedHandler(accessDeniedHandler)
                )
                .sessionManagement(session -> session.sessionCreationPolicy(
                        googleOAuthEnabled ? SessionCreationPolicy.IF_REQUIRED : SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // OpenAPI / Swagger endpoints
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/api-docs/**",
                                "/v3/api-docs/**"
                        ).permitAll()
                        // Actuator monitoring endpoints
                        .requestMatchers("/actuator/**").permitAll()
                        // Public Health probes
                        .requestMatchers("/api/v1/health/**").permitAll()
                        // Public Auth endpoints
                        .requestMatchers("/api/v1/auth/register", "/api/v1/auth/login", "/api/v1/auth/logout",
                                "/api/v1/auth/session", "/api/v1/auth/csrf",
                                "/oauth2/**", "/login/oauth2/**").permitAll()
                        // Public Catalog Browsing (GET only)
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/categories/**", "/api/v1/products/**").permitAll()
                        // Public Inventory Availability (informational, SRS Section 99)
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/inventory/availability/**").permitAll()
                        // Public Cart
                        .requestMatchers("/api/v1/cart/**").permitAll()
                        // Public CMS and store settings
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/cms/**", "/api/v1/store/**").permitAll()
                        // Admin endpoints
                        .requestMatchers("/api/v1/admin/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                        // All other endpoints require authentication
                        .anyRequest().authenticated()
                );

        if (googleOAuthEnabled) {
            http.oauth2Login(oauth2 -> oauth2
                    .authorizationEndpoint(authorization -> authorization
                            .authorizationRequestResolver(authorizationRequestResolverProvider.getObject()))
                    .successHandler(googleOAuth2AuthenticationHandler)
                    .failureHandler(googleOAuth2AuthenticationHandler));
        }

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    @ConditionalOnProperty(prefix = "app.oauth2.google", name = "enabled", havingValue = "true")
    public OAuth2AuthorizationRequestResolver googleOAuth2AuthorizationRequestResolver(
            ClientRegistrationRepository clientRegistrationRepository) {
        DefaultOAuth2AuthorizationRequestResolver resolver =
                new DefaultOAuth2AuthorizationRequestResolver(
                        clientRegistrationRepository, "/oauth2/authorization");
        resolver.setAuthorizationRequestCustomizer(request ->
                request.additionalParameters(parameters -> parameters.put("prompt", "select_account")));
        return resolver;
    }

    private CsrfTokenRepository csrfTokenRepository() {
        CookieCsrfTokenRepository repository = CookieCsrfTokenRepository.withHttpOnlyFalse();
        repository.setCookieCustomizer(cookie -> cookie
                .path("/")
                .secure(secureCookiesEnabled)
                .sameSite(csrfCookieSameSite));
        return repository;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
