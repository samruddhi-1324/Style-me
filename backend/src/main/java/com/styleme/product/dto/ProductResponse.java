package com.styleme.product.dto;

import com.styleme.product.entity.Product;
import com.styleme.product.entity.ProductImage;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class ProductResponse {

    private String id;
    private String sku;
    private String name;
    private String category;
    private String color;
    private List<String> colors;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private BigDecimal rating;
    private Integer reviewCount;
    private String size;
    private String material;
    private String frameShape;
    private String frameColor;
    private List<String> faceShapes;
    private String gender;
    private String weight;
    private String prescriptionRange;
    private String warranty;
    private MeasurementsDto measurements;
    private String fit;
    private String fitNote;
    private List<String> badges;
    private List<String> images;
    private String description;
    private boolean inStock;
    private boolean isNew;
    private boolean isFeatured;
    private boolean isAiPick;
    private List<ProductVariantResponse> variants;

    public ProductResponse() {
        this.colors = new ArrayList<>();
        this.faceShapes = new ArrayList<>();
        this.badges = new ArrayList<>();
        this.images = new ArrayList<>();
        this.variants = new ArrayList<>();
    }

    public static ProductResponse fromEntity(Product product) {
        ProductResponse dto = new ProductResponse();
        dto.setId(product.getId());
        dto.setSku(product.getSku());
        dto.setName(product.getName());
        dto.setCategory(product.getCategory() != null ? product.getCategory().getName() : "");
        dto.setPrice(product.getPrice());
        dto.setOriginalPrice(product.getOriginalPrice() != null ? product.getOriginalPrice() : product.getPrice());
        dto.setRating(product.getRating());
        dto.setReviewCount(product.getReviewCount());
        dto.setSize(product.getSize());
        dto.setMaterial(product.getMaterial());
        dto.setFrameShape(product.getFrameShape());
        dto.setFrameColor(product.getFrameColor());
        dto.setGender(product.getGender());
        dto.setWeight(product.getWeight());
        dto.setPrescriptionRange(product.getPrescriptionRange());
        dto.setWarranty(product.getWarranty());
        dto.setMeasurements(MeasurementsDto.fromEntity(product.getMeasurements()));
        dto.setFit(product.getFit());
        dto.setFitNote(product.getFitNote());
        dto.setDescription(product.getDescription());
        dto.setInStock(product.isInStock());
        dto.setNew(product.isNew());
        dto.setFeatured(product.isFeatured());
        dto.setAiPick(product.isAiPick());

        // Badges & Face Shapes
        if (product.getBadges() != null) {
            dto.setBadges(new ArrayList<>(product.getBadges()));
        }
        if (product.getFaceShapes() != null) {
            dto.setFaceShapes(new ArrayList<>(product.getFaceShapes()));
        }

        // Images
        if (product.getImages() != null) {
            dto.setImages(product.getImages().stream()
                    .map(ProductImage::getImageUrl)
                    .collect(Collectors.toList()));
        }

        // Variants & Colors
        if (product.getVariants() != null && !product.getVariants().isEmpty()) {
            dto.setVariants(product.getVariants().stream()
                    .map(ProductVariantResponse::fromEntity)
                    .collect(Collectors.toList()));

            dto.setColor(product.getVariants().get(0).getColorName());
            dto.setColors(product.getVariants().stream()
                    .map(v -> v.getColorHex() != null ? v.getColorHex() : v.getColorName())
                    .collect(Collectors.toList()));
        } else {
            dto.setColor(product.getFrameColor() != null ? product.getFrameColor() : "Standard");
            dto.setColors(List.of(dto.getColor()));
        }

        return dto;
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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public List<String> getColors() {
        return colors;
    }

    public void setColors(List<String> colors) {
        this.colors = colors;
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

    public BigDecimal getRating() {
        return rating;
    }

    public void setRating(BigDecimal rating) {
        this.rating = rating;
    }

    public Integer getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(Integer reviewCount) {
        this.reviewCount = reviewCount;
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

    public List<String> getFaceShapes() {
        return faceShapes;
    }

    public void setFaceShapes(List<String> faceShapes) {
        this.faceShapes = faceShapes;
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

    public List<String> getBadges() {
        return badges;
    }

    public void setBadges(List<String> badges) {
        this.badges = badges;
    }

    public List<String> getImages() {
        return images;
    }

    public void setImages(List<String> images) {
        this.images = images;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isInStock() {
        return inStock;
    }

    public void setInStock(boolean inStock) {
        this.inStock = inStock;
    }

    public boolean isNew() {
        return isNew;
    }

    public void setNew(boolean aNew) {
        isNew = aNew;
    }

    public boolean isFeatured() {
        return isFeatured;
    }

    public void setFeatured(boolean featured) {
        isFeatured = featured;
    }

    public boolean isAiPick() {
        return isAiPick;
    }

    public void setAiPick(boolean aiPick) {
        isAiPick = aiPick;
    }

    public List<ProductVariantResponse> getVariants() {
        return variants;
    }

    public void setVariants(List<ProductVariantResponse> variants) {
        this.variants = variants;
    }
}
