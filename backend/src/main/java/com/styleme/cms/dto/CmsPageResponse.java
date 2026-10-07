package com.styleme.cms.dto;

import com.styleme.cms.entity.CmsPageStatus;
import com.styleme.cms.entity.PageType;

import java.time.Instant;

public record CmsPageResponse(
        Long id,
        String slug,
        PageType pageType,
        String title,
        String summary,
        String content,
        String seoTitle,
        String metaDescription,
        CmsPageStatus status,
        boolean showInNavigation,
        Instant publishedAt,
        Instant createdAt,
        Instant updatedAt
) {
}
