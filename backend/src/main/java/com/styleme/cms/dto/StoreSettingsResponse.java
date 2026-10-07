package com.styleme.cms.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record StoreSettingsResponse(
        Long id,
        String storeName,
        String supportEmail,
        String supportPhone,
        String currency,
        String locale,
        String timeZone,
        BigDecimal freeShippingThreshold,
        String shippingPolicy,
        String returnPolicy,
        String privacyPolicy,
        String termsAndConditions,
        String announcementMessage,
        String contactAddress,
        Instant updatedAt
) {
}
