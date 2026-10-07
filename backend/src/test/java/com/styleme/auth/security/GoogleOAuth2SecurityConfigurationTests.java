package com.styleme.auth.security;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(properties = {
        "app.oauth2.google.enabled=true",
        "spring.security.oauth2.client.registration.google.client-id=test-client-id",
        "spring.security.oauth2.client.registration.google.client-secret=test-client-secret"
})
@ActiveProfiles("test")
class GoogleOAuth2SecurityConfigurationTests {

    @Test
    void contextLoadsWithGoogleOAuthEnabled() {
    }
}
