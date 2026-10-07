package com.styleme.product.dto;

import com.styleme.product.entity.ProductVariant;

import java.util.UUID;

public class ProductVariantResponse {

    private UUID id;
    private String sku;
    private String colorName;
    private String colorHex;
    private Integer stockQuantity;
    private boolean inStock;

    public ProductVariantResponse() {
    }

    public static ProductVariantResponse fromEntity(ProductVariant variant) {
        ProductVariantResponse dto = new ProductVariantResponse();
        dto.setId(variant.getId());
        dto.setSku(variant.getSku());
        dto.setColorName(variant.getColorName());
        dto.setColorHex(variant.getColorHex());
        dto.setStockQuantity(variant.getStockQuantity());
        dto.setInStock(variant.isInStock());
        return dto;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getColorName() {
        return colorName;
    }

    public void setColorName(String colorName) {
        this.colorName = colorName;
    }

    public String getColorHex() {
        return colorHex;
    }

    public void setColorHex(String colorHex) {
        this.colorHex = colorHex;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public boolean isInStock() {
        return inStock;
    }

    public void setInStock(boolean inStock) {
        this.inStock = inStock;
    }
}
