package com.styleme.common.config;

import org.junit.jupiter.api.Test;
import org.springframework.boot.env.YamlPropertySourceLoader;
import org.springframework.core.io.ClassPathResource;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class ProductionConfigurationTests {

    @Test
    void productionProfileEnablesCrossSiteAuthAndUsesApplicationHealthPort() throws Exception {
        var properties = new YamlPropertySourceLoader()
                .load("production", new ClassPathResource("application-prod.yml"))
                .get(0);

        assertEquals(true, properties.getProperty("app.auth-cookie.secure"));
        assertEquals("None", properties.getProperty("app.auth-cookie.same-site"));
        assertEquals("${CSRF_ENABLED:true}", properties.getProperty("app.security.csrf-enabled"));
        assertEquals("${GOOGLE_CLIENT_ID}",
                properties.getProperty("spring.security.oauth2.client.registration.google.client-id"));
        assertNull(properties.getProperty("management.server.port"));
    }
}
