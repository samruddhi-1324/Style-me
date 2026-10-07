package com.styleme.common.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.csrf.CsrfTokenRequestHandler;
import org.springframework.security.web.csrf.XorCsrfTokenRequestAttributeHandler;
import org.springframework.util.StringUtils;

import java.util.function.Supplier;

public class SpaCsrfTokenRequestHandler implements CsrfTokenRequestHandler {

    private final CsrfTokenRequestAttributeHandler plain = new CsrfTokenRequestAttributeHandler();
    private final XorCsrfTokenRequestAttributeHandler xor = new XorCsrfTokenRequestAttributeHandler();

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       Supplier<CsrfToken> csrfToken) {
        xor.handle(request, response, csrfToken);
        csrfToken.get();
    }

    @Override
    public String resolveCsrfTokenValue(HttpServletRequest request, CsrfToken csrfToken) {
        String headerValue = request.getHeader(csrfToken.getHeaderName());
        if (!StringUtils.hasText(headerValue)) {
            return xor.resolveCsrfTokenValue(request, csrfToken);
        }

        String plainToken = plain.resolveCsrfTokenValue(request, csrfToken);
        return csrfToken.getToken().equals(plainToken)
                ? plainToken
                : xor.resolveCsrfTokenValue(request, csrfToken);
    }
}
