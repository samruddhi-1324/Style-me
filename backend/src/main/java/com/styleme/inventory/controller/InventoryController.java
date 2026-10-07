package com.styleme.inventory.controller;

import com.styleme.common.dto.ApiResponse;
import com.styleme.inventory.dto.*;
import com.styleme.inventory.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Inventory REST API.
 *
 * Public endpoint:
 *   GET /api/v1/inventory/availability/{sku} — Frontend stock display (informational, SRS Section 99)
 *
 * Admin endpoints (ADMIN, SUPER_ADMIN, or CATALOG_MANAGER / ORDER_MANAGER):
 *   POST   /api/v1/inventory               — Create inventory record
 *   GET    /api/v1/inventory/{sku}         — Full inventory detail
 *   GET    /api/v1/inventory/product/{id}  — All SKUs for a product
 *   GET    /api/v1/inventory/low-stock     — Low-stock alert list
 *   GET    /api/v1/inventory/out-of-stock  — Out-of-stock list
 *   POST   /api/v1/inventory/{id}/adjust   — Admin stock adjustment
 *   GET    /api/v1/inventory/{id}/history  — Audit movement history
 *
 * Internal (called by other services, not exposed to frontend):
 *   POST   /api/v1/inventory/{sku}/reserve — Reserve stock
 *   POST   /api/v1/inventory/{sku}/release — Release reservation
 *   POST   /api/v1/inventory/{sku}/deduct  — Deduct on purchase
 *   POST   /api/v1/inventory/{sku}/restock — Add stock
 */
@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventory", description = "Inventory management and stock operations")
public class InventoryController {

    private final InventoryService inventoryService;

    // -------------------------------------------------------------------------
    // Public — informational availability (SRS 99: frontend display only)
    // -------------------------------------------------------------------------

    @GetMapping("/availability/{sku}")
    @Operation(summary = "Check availability of a SKU (public, informational)")
    public ResponseEntity<ApiResponse<InventoryResponse>> checkAvailability(@PathVariable String sku) {
        InventoryResponse inv = inventoryService.getBySkuId(sku);
        return ResponseEntity.ok(ApiResponse.success("Availability retrieved", inv));
    }

    // -------------------------------------------------------------------------
    // Admin: Create inventory record
    // -------------------------------------------------------------------------

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','CATALOG_MANAGER')")
    @Operation(summary = "Create inventory record for a product/variant")
    public ResponseEntity<ApiResponse<InventoryResponse>> createInventory(
            @Valid @RequestBody CreateInventoryRequest req) {
        InventoryResponse inv = inventoryService.createInventory(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Inventory created", inv));
    }

    // -------------------------------------------------------------------------
    // Admin: Read
    // -------------------------------------------------------------------------

    @GetMapping("/{sku}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','CATALOG_MANAGER','ORDER_MANAGER')")
    @Operation(summary = "Get full inventory detail by SKU")
    public ResponseEntity<ApiResponse<InventoryResponse>> getInventory(@PathVariable String sku) {
        return ResponseEntity.ok(ApiResponse.success("Inventory retrieved", inventoryService.getBySkuId(sku)));
    }

    @GetMapping("/product/{productId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','CATALOG_MANAGER','ORDER_MANAGER')")
    @Operation(summary = "Get all inventory records for a product")
    public ResponseEntity<ApiResponse<List<InventoryResponse>>> getByProduct(@PathVariable String productId) {
        return ResponseEntity.ok(ApiResponse.success("Product inventory retrieved",
                inventoryService.getByProductId(productId)));
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','CATALOG_MANAGER','ORDER_MANAGER')")
    @Operation(summary = "List all low-stock items")
    public ResponseEntity<ApiResponse<List<InventoryResponse>>> getLowStock() {
        return ResponseEntity.ok(ApiResponse.success("Low stock items retrieved",
                inventoryService.getLowStockItems()));
    }

    @GetMapping("/out-of-stock")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','CATALOG_MANAGER','ORDER_MANAGER')")
    @Operation(summary = "List all out-of-stock items")
    public ResponseEntity<ApiResponse<List<InventoryResponse>>> getOutOfStock() {
        return ResponseEntity.ok(ApiResponse.success("Out of stock items retrieved",
                inventoryService.getOutOfStockItems()));
    }

    @GetMapping("/{inventoryId}/history")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','CATALOG_MANAGER','ORDER_MANAGER')")
    @Operation(summary = "Get stock movement audit history")
    public ResponseEntity<ApiResponse<List<InventoryMovementResponse>>> getMovementHistory(
            @PathVariable Long inventoryId) {
        return ResponseEntity.ok(ApiResponse.success("Movement history retrieved",
                inventoryService.getMovementHistory(inventoryId)));
    }

    // -------------------------------------------------------------------------
    // Admin: Stock adjustment
    // -------------------------------------------------------------------------

    @PostMapping("/{inventoryId}/adjust")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','CATALOG_MANAGER')")
    @Operation(summary = "Admin stock adjustment (restock, damaged, transfer, return)")
    public ResponseEntity<ApiResponse<InventoryResponse>> adjust(
            @PathVariable Long inventoryId,
            @Valid @RequestBody StockAdjustmentRequest req) {
        InventoryResponse inv = inventoryService.adjust(inventoryId, req);
        return ResponseEntity.ok(ApiResponse.success("Stock adjusted", inv));
    }

    // -------------------------------------------------------------------------
    // Internal: Concurrency-safe stock operations (called by Cart/Order services)
    // Secured as admin/order manager — these are internal API calls, not user-facing
    // -------------------------------------------------------------------------

    @PostMapping("/{sku}/reserve")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','ORDER_MANAGER')")
    @Operation(summary = "Reserve stock (cart/order hold)")
    public ResponseEntity<ApiResponse<InventoryResponse>> reserve(
            @PathVariable String sku,
            @RequestParam int qty,
            @RequestParam(required = false) String referenceId,
            @RequestParam(required = false) String referenceType) {
        return ResponseEntity.ok(ApiResponse.success("Stock reserved",
                inventoryService.reserve(sku, qty, referenceId, referenceType)));
    }

    @PostMapping("/{sku}/release")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','ORDER_MANAGER')")
    @Operation(summary = "Release stock reservation")
    public ResponseEntity<ApiResponse<InventoryResponse>> release(
            @PathVariable String sku,
            @RequestParam int qty,
            @RequestParam(required = false) String referenceId,
            @RequestParam(required = false) String referenceType) {
        return ResponseEntity.ok(ApiResponse.success("Reservation released",
                inventoryService.release(sku, qty, referenceId, referenceType)));
    }

    @PostMapping("/{sku}/deduct")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','ORDER_MANAGER')")
    @Operation(summary = "Deduct stock on confirmed purchase")
    public ResponseEntity<ApiResponse<InventoryResponse>> deduct(
            @PathVariable String sku,
            @RequestParam int qty,
            @RequestParam(required = false) String referenceId,
            @RequestParam(required = false) String referenceType) {
        return ResponseEntity.ok(ApiResponse.success("Stock deducted",
                inventoryService.deduct(sku, qty, referenceId, referenceType)));
    }

    @PostMapping("/{sku}/restock")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','CATALOG_MANAGER')")
    @Operation(summary = "Add new stock (receiving shipment)")
    public ResponseEntity<ApiResponse<InventoryResponse>> restock(
            @PathVariable String sku,
            @RequestParam int qty,
            @RequestParam(required = false) String referenceId,
            @RequestParam(required = false) String note) {
        return ResponseEntity.ok(ApiResponse.success("Stock restocked",
                inventoryService.restock(sku, qty, referenceId, note)));
    }
}
