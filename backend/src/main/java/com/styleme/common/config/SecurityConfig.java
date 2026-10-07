package com.styleme.common.config;

import com.styleme.auth.security.CustomAccessDeniedHandler;
import com.styleme.auth.security.GoogleOAuth2AuthenticationHandler;
import com.styleme.auth.security.JwtAuthenticationEntryPoint;
import com.styleme.auth.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private final boolean googleOAuthEnabled;

    public SecurityConfig(CorsConfigurationSource corsConfigurationSource,
                          JwtAuthenticationEntryPoint unauthorizedHandler,
                          CustomAccessDeniedHandler accessDeniedHandler,
                          JwtAuthenticationFilter jwtAuthenticationFilter,
                          GoogleOAuth2AuthenticationHandler googleOAuth2AuthenticationHandler,
                          @Value("${app.oauth2.google.enabled:false}") boolean googleOAuthEnabled) {
        this.corsConfigurationSource = corsConfigurationSource;
        this.unauthorizedHandler = unauthorizedHandler;
        this.accessDeniedHandler = accessDeniedHandler;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.googleOAuth2AuthenticationHandler = googleOAuth2AuthenticationHandler;
        this.googleOAuthEnabled = googleOAuthEnabled;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(AbstractHttpConfigurer::disable)
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
                                "/api/v1/auth/session", "/oauth2/**", "/login/oauth2/**").permitAll()
                        // Public Catalog Browsing (GET only)
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/categories/**", "/api/v1/products/**").permitAll()
                        // Admin endpoints
                        .requestMatchers("/api/v1/admin/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                        // All other endpoints require authentication
                        .anyRequest().authenticated()
                );

        if (googleOAuthEnabled) {
            http.oauth2Login(oauth2 -> oauth2
                    .successHandler(googleOAuth2AuthenticationHandler)
                    .failureHandler(googleOAuth2AuthenticationHandler));
        }

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
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
