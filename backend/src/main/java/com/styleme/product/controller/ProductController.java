package com.styleme.product.controller;

import com.styleme.common.dto.ApiResponse;
import com.styleme.common.dto.PageResponse;
import com.styleme.product.dto.CreateProductRequest;
import com.styleme.product.dto.ProductFilterCriteria;
import com.styleme.product.dto.ProductResponse;
import com.styleme.product.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@Tag(name = "Products", description = "Product catalog, faceted filtering, PDP, and inventory management APIs")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    @Operation(summary = "Search and filter products", description = "Faceted catalog query supporting category, gender, shape, material, price range, text search, sorting, and pagination.")
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> getProducts(
            @ModelAttribute ProductFilterCriteria criteria) {
        PageResponse<ProductResponse> response = productService.getProducts(criteria);
        return ResponseEntity.ok(ApiResponse.success("Products retrieved successfully", response));
    }

    @GetMapping("/featured")
    @Operation(summary = "Get featured products", description = "Returns active curated featured frames.")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getFeaturedProducts() {
        List<ProductResponse> featured = productService.getFeaturedProducts();
        return ResponseEntity.ok(ApiResponse.success("Featured products retrieved successfully", featured));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID", description = "Returns full Product Detail Page (PDP) specifications, measurements, badges, and variants.")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable String id) {
        ProductResponse product = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success("Product retrieved successfully", product));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'CATALOG_MANAGER')")
    @Operation(summary = "Create product", description = "Adds a new product to the catalog. Restricted to Catalog Managers and Admins.")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @Valid @RequestBody CreateProductRequest request) {
        ProductResponse created = productService.createProduct(request);
        return new ResponseEntity<>(
                ApiResponse.success("Product created successfully", created),
                HttpStatus.CREATED
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'CATALOG_MANAGER')")
    @Operation(summary = "Update product", description = "Updates product details. Restricted to Catalog Managers and Admins.")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable String id, @Valid @RequestBody CreateProductRequest request) {
        ProductResponse updated = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Delete product", description = "Archives a product from active catalog. Restricted to Administrators.")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable String id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product archived successfully", null));
    }
}
