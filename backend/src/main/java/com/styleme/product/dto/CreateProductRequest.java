package com.styleme.product.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public class CreateProductRequest {

    @NotBlank(message = "Product ID is required (e.g. frame-027)")
    @Size(max = 64)
    private String id;

    @Size(max = 100)
    private String sku;

    @NotBlank(message = "Product name is required")
    @Size(max = 255)
    private String name;

    @NotNull(message = "Category ID is required")
    private Integer categoryId;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than zero")
    private BigDecimal price;

    private BigDecimal originalPrice;

    @NotBlank(message = "Size is required (Small, Medium, Large)")
    private String size;

    @NotBlank(message = "Material is required (Acetate, Titanium, etc.)")
    private String material;

    @NotBlank(message = "Frame shape is required (Round, Rectangle, etc.)")
    private String frameShape;

    private String frameColor;

    @NotBlank(message = "Gender is required (Men, Women, Unisex, Kids)")
    private String gender;

    private String weight;
    private String prescriptionRange;
    private String warranty;
    private MeasurementsDto measurements;
    private String fit = "Good";
    private String fitNote;
    private String description;
    private Boolean inStock = true;
    private Boolean isNew = false;
    private Boolean isFeatured = false;
    private Boolean isAiPick = false;
    private List<String> badges;
    private List<String> faceShapes;
    private List<String> images;

    public CreateProductRequest() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Integer categoryId) {
        this.categoryId = categoryId;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public BigDecimal getOriginalPrice() {
        return originalPrice;
    }

    public void setOriginalPrice(BigDecimal originalPrice) {
        this.originalPrice = originalPrice;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public String getMaterial() {
        return material;
    }

    public void setMaterial(String material) {
        this.material = material;
    }

    public String getFrameShape() {
        return frameShape;
    }

    public void setFrameShape(String frameShape) {
        this.frameShape = frameShape;
    }

    public String getFrameColor() {
        return frameColor;
    }

    public void setFrameColor(String frameColor) {
        this.frameColor = frameColor;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getWeight() {
        return weight;
    }

    public void setWeight(String weight) {
        this.weight = weight;
    }

    public String getPrescriptionRange() {
        return prescriptionRange;
    }

    public void setPrescriptionRange(String prescriptionRange) {
        this.prescriptionRange = prescriptionRange;
    }

    public String getWarranty() {
        return warranty;
    }

    public void setWarranty(String warranty) {
        this.warranty = warranty;
    }

    public MeasurementsDto getMeasurements() {
        return measurements;
    }

    public void setMeasurements(MeasurementsDto measurements) {
        this.measurements = measurements;
    }

    public String getFit() {
        return fit;
    }

    public void setFit(String fit) {
        this.fit = fit;
    }

    public String getFitNote() {
        return fitNote;
    }

    public void setFitNote(String fitNote) {
        this.fitNote = fitNote;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getInStock() {
        return inStock;
    }

    public void setInStock(Boolean inStock) {
        this.inStock = inStock;
    }

    public Boolean getNew() {
        return isNew;
    }

    public void setNew(Boolean aNew) {
        isNew = aNew;
    }

    public Boolean getFeatured() {
        return isFeatured;
    }

    public void setFeatured(Boolean featured) {
        isFeatured = featured;
    }

    public Boolean getAiPick() {
        return isAiPick;
    }

    public void setAiPick(Boolean aiPick) {
        isAiPick = aiPick;
    }

    public List<String> getBadges() {
        return badges;
    }

    public void setBadges(List<String> badges) {
        this.badges = badges;
    }

    public List<String> getFaceShapes() {
        return faceShapes;
    }

    public void setFaceShapes(List<String> faceShapes) {
        this.faceShapes = faceShapes;
    }

    public List<String> getImages() {
        return images;
    }

    public void setImages(List<String> images) {
        this.images = images;
    }
}
