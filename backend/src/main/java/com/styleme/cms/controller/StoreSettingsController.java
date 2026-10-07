package com.styleme.cms.controller;

import com.styleme.cms.dto.StoreSettingsRequest;
import com.styleme.cms.dto.StoreSettingsResponse;
import com.styleme.cms.service.CmsService;
import com.styleme.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class StoreSettingsController {

    private final CmsService cmsService;

    @GetMapping("/store/settings")
    public ResponseEntity<ApiResponse<StoreSettingsResponse>> getStoreSettings() {
        return ResponseEntity.ok(ApiResponse.success("Store settings retrieved", cmsService.getStoreSettings()));
    }

    @PutMapping("/admin/store/settings")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<StoreSettingsResponse>> updateStoreSettings(
            @Valid @RequestBody StoreSettingsRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Store settings updated", cmsService.updateStoreSettings(request)));
    }
}
