package com.styleme.cms.service;

import com.styleme.cms.dto.CreateCmsPageRequest;
import com.styleme.cms.dto.StoreSettingsRequest;
import com.styleme.cms.entity.CmsPage;
import com.styleme.cms.entity.CmsPageStatus;
import com.styleme.cms.entity.PageType;
import com.styleme.cms.entity.StoreSettings;
import com.styleme.cms.repository.CmsPageRepository;
import com.styleme.cms.repository.StoreSettingsRepository;
import com.styleme.common.exception.BadRequestException;
import com.styleme.common.exception.ConflictException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CmsServiceTests {

    @Mock private CmsPageRepository cmsPageRepository;
    @Mock private StoreSettingsRepository storeSettingsRepository;

    private CmsService cmsService;

    @BeforeEach
    void setUp() {
        cmsService = new CmsService(cmsPageRepository, storeSettingsRepository);
    }

    @Test
    void createPage_publishesAndPersistsPage() {
        CreateCmsPageRequest request = new CreateCmsPageRequest();
        request.setSlug("About Us");
        request.setPageType(PageType.ABOUT);
        request.setTitle("About Us");
        request.setContent("<p>We craft premium eyewear.</p>");
        request.setStatus(CmsPageStatus.PUBLISHED);

        CmsPage page = new CmsPage();
        page.setId(1L);
        page.setSlug("about-us");
        page.setPageType(PageType.ABOUT);
        page.setTitle("About Us");
        page.setContent("<p>We craft premium eyewear.</p>");
        page.setStatus(CmsPageStatus.PUBLISHED);

        when(cmsPageRepository.existsBySlug("about-us")).thenReturn(false);
        when(cmsPageRepository.save(any(CmsPage.class))).thenReturn(page);

        var response = cmsService.createPage(request);

        assertNotNull(response);
        assertEquals("about-us", response.slug());
        assertEquals(PageType.ABOUT, response.pageType());
        assertEquals(CmsPageStatus.PUBLISHED, response.status());
        verify(cmsPageRepository).save(any(CmsPage.class));
    }

    @Test
    void getPublishedPageBySlug_throwsWhenDraftOnly() {
        CmsPage page = new CmsPage();
        page.setSlug("faq");
        page.setTitle("FAQ");
        page.setContent("<p>FAQ content</p>");
        page.setStatus(CmsPageStatus.DRAFT);

        when(cmsPageRepository.findBySlug("faq")).thenReturn(Optional.of(page));

        assertThrows(RuntimeException.class, () -> cmsService.getPublishedPageBySlug("faq"));
    }

    @Test
    void updateStoreSettings_replacesValues() {
        StoreSettings settings = new StoreSettings();
        settings.setId(1L);
        settings.setStoreName("Old Name");
        settings.setFreeShippingThreshold(BigDecimal.ZERO);

        when(storeSettingsRepository.findAll()).thenReturn(List.of(settings));
        when(storeSettingsRepository.save(any(StoreSettings.class))).thenAnswer(invocation -> invocation.getArgument(0));

        StoreSettingsRequest request = new StoreSettingsRequest();
        request.setStoreName("StyleMe Eyewear");
        request.setSupportEmail("support@styleme.com");
        request.setFreeShippingThreshold(new BigDecimal("2500.00"));

        var response = cmsService.updateStoreSettings(request);

        assertEquals("StyleMe Eyewear", response.storeName());
        assertEquals("support@styleme.com", response.supportEmail());
        assertEquals(new BigDecimal("2500.00"), response.freeShippingThreshold());
        verify(storeSettingsRepository).save(any(StoreSettings.class));
    }

    @Test
    void createPage_duplicateSlug_throwsConflict() {
        CreateCmsPageRequest request = new CreateCmsPageRequest();
        request.setSlug("about");
        request.setPageType(PageType.ABOUT);
        request.setTitle("About");
        request.setContent("<p>content</p>");

        when(cmsPageRepository.existsBySlug("about")).thenReturn(true);

        assertThrows(ConflictException.class, () -> cmsService.createPage(request));
    }

    @Test
    void normalizeSlug_rejectsBlankSlug() {
        CreateCmsPageRequest request = new CreateCmsPageRequest();
        request.setSlug("   ");
        request.setPageType(PageType.CUSTOM);
        request.setTitle("Blank");
        request.setContent("content");

        assertThrows(BadRequestException.class, () -> cmsService.createPage(request));
    }
}
