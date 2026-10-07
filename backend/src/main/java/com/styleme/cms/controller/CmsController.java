package com.styleme.cms.controller;

import com.styleme.cms.dto.CmsPageResponse;
import com.styleme.cms.dto.CreateCmsPageRequest;
import com.styleme.cms.dto.UpdateCmsPageRequest;
import com.styleme.cms.service.CmsService;
import com.styleme.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class CmsController {

    private final CmsService cmsService;

    @GetMapping("/cms/pages")
    public ResponseEntity<ApiResponse<List<CmsPageResponse>>> getPublishedPages() {
        return ResponseEntity.ok(ApiResponse.success("Published pages retrieved", cmsService.getPublishedPages()));
    }

    @GetMapping("/cms/pages/{slug}")
    public ResponseEntity<ApiResponse<CmsPageResponse>> getPageBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success("Page retrieved", cmsService.getPublishedPageBySlug(slug)));
    }

    @GetMapping("/admin/cms/pages")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<CmsPageResponse>>> getAllPagesForAdmin() {
        return ResponseEntity.ok(ApiResponse.success("Pages retrieved", cmsService.getAllPagesForAdmin()));
    }

    @PostMapping("/admin/cms/pages")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<CmsPageResponse>> createPage(@Valid @RequestBody CreateCmsPageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Page created successfully", cmsService.createPage(request)));
    }

    @PutMapping("/admin/cms/pages/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<CmsPageResponse>> updatePage(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCmsPageRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Page updated successfully", cmsService.updatePage(id, request)));
    }

    @DeleteMapping("/admin/cms/pages/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deletePage(@PathVariable Long id) {
        cmsService.deletePage(id);
        return ResponseEntity.ok(ApiResponse.success("Page archived successfully", null));
    }
}
