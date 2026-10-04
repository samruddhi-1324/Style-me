package com.styleme;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class StyleMeApplicationTests {

    @Test
    @DisplayName("Spring Application Context should load successfully")
    void contextLoads() {
        // Verification that all Spring beans and configuration initialize without errors
    }
}
