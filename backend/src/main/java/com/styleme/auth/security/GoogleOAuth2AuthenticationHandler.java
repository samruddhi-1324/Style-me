package com.styleme.auth.security;

import com.styleme.auth.dto.AuthResponse;
import com.styleme.auth.service.AuthService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.time.Duration;

@Component
public class GoogleOAuth2AuthenticationHandler
        implements AuthenticationSuccessHandler, AuthenticationFailureHandler {

    private static final Logger log = LoggerFactory.getLogger(GoogleOAuth2AuthenticationHandler.class);

    private final ObjectProvider<AuthService> authServiceProvider;
    private final String frontendUrl;
    private final String cookieName;
    private final boolean secureCookie;
    private final String sameSite;

    public GoogleOAuth2AuthenticationHandler(
            ObjectProvider<AuthService> authServiceProvider,
            @Value("${app.frontend-url:http://localhost:3000}") String frontendUrl,
            @Value("${app.auth-cookie.name:STYLEME_SESSION}") String cookieName,
            @Value("${app.auth-cookie.secure:false}") boolean secureCookie,
            @Value("${app.auth-cookie.same-site:Lax}") String sameSite) {
        this.authServiceProvider = authServiceProvider;
        this.frontendUrl = frontendUrl;
        this.cookieName = cookieName;
        this.secureCookie = secureCookie;
        this.sameSite = sameSite;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        if (!(authentication instanceof OAuth2AuthenticationToken googleAuthentication)
                || !"google".equals(googleAuthentication.getAuthorizedClientRegistrationId())) {
            onAuthenticationFailure(request, response, null);
            return;
        }

        try {
            AuthResponse session = authServiceProvider.getObject().loginWithGoogle(
                    googleAuthentication.getPrincipal().getAttributes());
            response.addHeader(HttpHeaders.SET_COOKIE, sessionCookieHeader(session));
            invalidateOAuthSession(request);
            response.sendRedirect(frontendLocation("/account", "oauth=success"));
        } catch (AuthenticationException exception) {
            onAuthenticationFailure(request, response, exception);
        }
    }

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                       AuthenticationException exception) throws IOException {
        if (exception != null) {
            log.warn("Google OAuth sign-in was rejected: {}", exception.getClass().getSimpleName());
        }
        invalidateOAuthSession(request);
        response.sendRedirect(frontendLocation("/login", "oauth=error"));
    }

    private void invalidateOAuthSession(HttpServletRequest request) {
        var session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
    }

    private String frontendLocation(String path, String query) {
        return UriComponentsBuilder.fromUriString(frontendUrl)
                .replacePath(path)
                .replaceQuery(query)
                .build()
                .toUriString();
    }

    public String expiredCookieHeader() {
        return ResponseCookie.from(cookieName, "")
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite(sameSite)
                .path("/")
                .maxAge(Duration.ZERO)
                .build()
                .toString();
    }

    public String sessionCookieHeader(AuthResponse session) {
        return ResponseCookie.from(cookieName, session.getAccessToken())
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite(sameSite)
                .path("/")
                .maxAge(Duration.ofMillis(session.getExpiresIn()))
                .build()
                .toString();
    }
}
