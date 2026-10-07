package com.styleme.cms.service;

import com.styleme.cms.dto.*;
import com.styleme.cms.entity.CmsPage;
import com.styleme.cms.entity.CmsPageStatus;
import com.styleme.cms.entity.StoreSettings;
import com.styleme.cms.repository.CmsPageRepository;
import com.styleme.cms.repository.StoreSettingsRepository;
import com.styleme.common.exception.BadRequestException;
import com.styleme.common.exception.ConflictException;
import com.styleme.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CmsService {

    private final CmsPageRepository cmsPageRepository;
    private final StoreSettingsRepository storeSettingsRepository;

    @Transactional
    public CmsPageResponse createPage(CreateCmsPageRequest request) {
        String slug = normalizeSlug(request.getSlug());
        if (cmsPageRepository.existsBySlug(slug)) {
            throw new ConflictException("A page with this slug already exists");
        }

        CmsPage page = new CmsPage();
        page.setSlug(slug);
        page.setPageType(request.getPageType());
        page.setTitle(request.getTitle());
        page.setSummary(request.getSummary());
        page.setContent(request.getContent());
        page.setSeoTitle(request.getSeoTitle());
        page.setMetaDescription(request.getMetaDescription());
        page.setStatus(request.getStatus() != null ? request.getStatus() : CmsPageStatus.PUBLISHED);
        page.setShowInNavigation(request.isShowInNavigation());
        if (page.getStatus() == CmsPageStatus.PUBLISHED) {
            page.setPublishedAt(Instant.now());
        }

        return toResponse(cmsPageRepository.save(page));
    }

    @Transactional(readOnly = true)
    public List<CmsPageResponse> getPublishedPages() {
        return cmsPageRepository.findByStatusOrderByUpdatedAtDesc(CmsPageStatus.PUBLISHED)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CmsPageResponse getPublishedPageBySlug(String slug) {
        CmsPage page = cmsPageRepository.findBySlug(normalizeSlug(slug))
                .orElseThrow(() -> new ResourceNotFoundException("Page not found"));

        if (page.getStatus() != CmsPageStatus.PUBLISHED) {
            throw new ResourceNotFoundException("Page not found");
        }

        return toResponse(page);
    }

    @Transactional(readOnly = true)
    public List<CmsPageResponse> getAllPagesForAdmin() {
        return cmsPageRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public CmsPageResponse updatePage(Long pageId, UpdateCmsPageRequest request) {
        CmsPage page = cmsPageRepository.findById(pageId)
                .orElseThrow(() -> new ResourceNotFoundException("Page not found"));

        if (request.getSlug() != null && !request.getSlug().isBlank()) {
            String slug = normalizeSlug(request.getSlug());
            if (!slug.equals(page.getSlug()) && cmsPageRepository.existsBySlug(slug)) {
                throw new ConflictException("A page with this slug already exists");
            }
            page.setSlug(slug);
        }

        if (request.getPageType() != null) {
            page.setPageType(request.getPageType());
        }
        if (request.getTitle() != null) {
            page.setTitle(request.getTitle());
        }
        if (request.getSummary() != null) {
            page.setSummary(request.getSummary());
        }
        if (request.getContent() != null) {
            page.setContent(request.getContent());
        }
        if (request.getSeoTitle() != null) {
            page.setSeoTitle(request.getSeoTitle());
        }
        if (request.getMetaDescription() != null) {
            page.setMetaDescription(request.getMetaDescription());
        }
        if (request.getStatus() != null) {
            page.setStatus(request.getStatus());
            if (request.getStatus() == CmsPageStatus.PUBLISHED && page.getPublishedAt() == null) {
                page.setPublishedAt(Instant.now());
            }
        }
        if (request.getShowInNavigation() != null) {
            page.setShowInNavigation(request.getShowInNavigation());
        }

        return toResponse(cmsPageRepository.save(page));
    }

    @Transactional
    public void deletePage(Long pageId) {
        CmsPage page = cmsPageRepository.findById(pageId)
                .orElseThrow(() -> new ResourceNotFoundException("Page not found"));
        page.setStatus(CmsPageStatus.ARCHIVED);
        cmsPageRepository.save(page);
    }

    @Transactional
    public StoreSettingsResponse getStoreSettings() {
        StoreSettings settings = storeSettingsRepository.findAll().stream().findFirst()
                .orElseGet(() -> storeSettingsRepository.save(new StoreSettings()));
        return toSettingsResponse(settings);
    }

    @Transactional
    public StoreSettingsResponse updateStoreSettings(StoreSettingsRequest request) {
        StoreSettings settings = storeSettingsRepository.findAll().stream().findFirst()
                .orElseGet(() -> new StoreSettings());

        if (request.getStoreName() != null && !request.getStoreName().isBlank()) {
            settings.setStoreName(request.getStoreName());
        }
        if (request.getSupportEmail() != null) {
            settings.setSupportEmail(request.getSupportEmail());
        }
        if (request.getSupportPhone() != null) {
            settings.setSupportPhone(request.getSupportPhone());
        }
        if (request.getCurrency() != null && !request.getCurrency().isBlank()) {
            settings.setCurrency(request.getCurrency());
        }
        if (request.getLocale() != null && !request.getLocale().isBlank()) {
            settings.setLocale(request.getLocale());
        }
        if (request.getTimeZone() != null && !request.getTimeZone().isBlank()) {
            settings.setTimeZone(request.getTimeZone());
        }
        if (request.getFreeShippingThreshold() != null) {
            settings.setFreeShippingThreshold(request.getFreeShippingThreshold());
        }
        if (request.getShippingPolicy() != null) {
            settings.setShippingPolicy(request.getShippingPolicy());
        }
        if (request.getReturnPolicy() != null) {
            settings.setReturnPolicy(request.getReturnPolicy());
        }
        if (request.getPrivacyPolicy() != null) {
            settings.setPrivacyPolicy(request.getPrivacyPolicy());
        }
        if (request.getTermsAndConditions() != null) {
            settings.setTermsAndConditions(request.getTermsAndConditions());
        }
        if (request.getAnnouncementMessage() != null) {
            settings.setAnnouncementMessage(request.getAnnouncementMessage());
        }
        if (request.getContactAddress() != null) {
            settings.setContactAddress(request.getContactAddress());
        }

        return toSettingsResponse(storeSettingsRepository.save(settings));
    }

    private String normalizeSlug(String rawSlug) {
        String slug = rawSlug == null ? "" : rawSlug.trim();
        if (slug.isEmpty()) {
            throw new BadRequestException("Slug is required");
        }
        return slug.toLowerCase().replaceAll("\\s+", "-");
    }

    private CmsPageResponse toResponse(CmsPage page) {
        return new CmsPageResponse(
                page.getId(),
                page.getSlug(),
                page.getPageType(),
                page.getTitle(),
                page.getSummary(),
                page.getContent(),
                page.getSeoTitle(),
                page.getMetaDescription(),
                page.getStatus(),
                page.isShowInNavigation(),
                page.getPublishedAt(),
                page.getCreatedAt(),
                page.getUpdatedAt()
        );
    }

    private StoreSettingsResponse toSettingsResponse(StoreSettings settings) {
        return new StoreSettingsResponse(
                settings.getId(),
                settings.getStoreName(),
                settings.getSupportEmail(),
                settings.getSupportPhone(),
                settings.getCurrency(),
                settings.getLocale(),
                settings.getTimeZone(),
                settings.getFreeShippingThreshold(),
                settings.getShippingPolicy(),
                settings.getReturnPolicy(),
                settings.getPrivacyPolicy(),
                settings.getTermsAndConditions(),
                settings.getAnnouncementMessage(),
                settings.getContactAddress(),
                settings.getUpdatedAt()
        );
    }
}
