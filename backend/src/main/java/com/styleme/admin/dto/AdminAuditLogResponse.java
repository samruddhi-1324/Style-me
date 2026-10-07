package com.styleme.admin.dto;

import java.time.Instant;

public record AdminAuditLogResponse(
        Long id,
        String action,
        String entityType,
        String entityId,
        String performedBy,
        String result,
        String details,
        Instant createdAt
) {
}
