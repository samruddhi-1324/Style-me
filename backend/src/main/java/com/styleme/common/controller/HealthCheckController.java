package com.styleme.common.controller;

import com.styleme.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/health")
@Tag(name = "Health", description = "System health, readiness and probe APIs")
public class HealthCheckController {

    @Value("${spring.application.name:styleme-backend}")
    private String applicationName;

    @GetMapping
    @Operation(summary = "Check backend service health", description = "Returns service health status, application name, version, and server timestamp.")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkHealth() {
        Map<String, Object> healthData = new HashMap<>();
        healthData.put("status", "UP");
        healthData.put("application", applicationName);
        healthData.put("version", "1.0.0");
        healthData.put("timestamp", Instant.now().toString());

        return ResponseEntity.ok(ApiResponse.success("StyleMe backend service is healthy and operational", healthData));
    }
}
