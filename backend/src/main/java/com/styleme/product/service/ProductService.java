package com.styleme.product.service;

import com.styleme.category.entity.Category;
import com.styleme.category.repository.CategoryRepository;
import com.styleme.common.dto.PageResponse;
import com.styleme.common.exception.ConflictException;
import com.styleme.common.exception.ResourceNotFoundException;
import com.styleme.product.dto.CreateProductRequest;
import com.styleme.product.dto.ProductFilterCriteria;
import com.styleme.product.dto.ProductResponse;
import com.styleme.product.entity.Product;
import com.styleme.product.entity.ProductImage;
import com.styleme.product.entity.ProductMeasurements;
import com.styleme.product.repository.ProductRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getProducts(ProductFilterCriteria criteria) {
        Specification<Product> spec = buildSpecification(criteria);
        Sort sort = buildSort(criteria.getSortBy());
        Pageable pageable = PageRequest.of(criteria.getPage() - 1, criteria.getPageSize(), sort);

        Page<Product> page = productRepository.findAll(spec, pageable);
        List<ProductResponse> items = page.getContent().stream()
                .map(ProductResponse::fromEntity)
                .collect(Collectors.toList());

        return new PageResponse<>(items, criteria.getPage(), criteria.getPageSize(), page.getTotalElements());
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return ProductResponse.fromEntity(product);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getFeaturedProducts() {
        return productRepository.findByStatusAndIsFeaturedTrue("ACTIVE").stream()
                .map(ProductResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductResponse createProduct(CreateProductRequest request) {
        if (productRepository.existsById(request.getId())) {
            throw new ConflictException("Product with ID '" + request.getId() + "' already exists", "PRODUCT_ID_EXISTS");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        Product product = new Product(
                request.getId(),
                request.getSku(),
                request.getName(),
                category,
                request.getPrice()
        );

        product.setOriginalPrice(request.getOriginalPrice() != null ? request.getOriginalPrice() : request.getPrice());
        product.setSize(request.getSize());
        product.setMaterial(request.getMaterial());
        product.setFrameShape(request.getFrameShape());
        product.setFrameColor(request.getFrameColor());
        product.setGender(request.getGender());
        product.setWeight(request.getWeight());
        product.setPrescriptionRange(request.getPrescriptionRange());
        product.setWarranty(request.getWarranty());
        product.setFit(request.getFit() != null ? request.getFit() : "Good");
        product.setFitNote(request.getFitNote());
        product.setDescription(request.getDescription());
        product.setInStock(request.getInStock() != null ? request.getInStock() : true);
        product.setNew(request.getNew() != null ? request.getNew() : false);
        product.setFeatured(request.getFeatured() != null ? request.getFeatured() : false);
        product.setAiPick(request.getAiPick() != null ? request.getAiPick() : false);

        if (request.getMeasurements() != null) {
            product.setMeasurements(new ProductMeasurements(
                    request.getMeasurements().getFrameWidth(),
                    request.getMeasurements().getLensHeight(),
                    request.getMeasurements().getBridgeWidth(),
                    request.getMeasurements().getTempleLength()
            ));
        }

        if (request.getBadges() != null) {
            product.setBadges(new HashSet<>(request.getBadges()));
        }
        if (request.getFaceShapes() != null) {
            product.setFaceShapes(new HashSet<>(request.getFaceShapes()));
        }

        if (request.getImages() != null) {
            for (int i = 0; i < request.getImages().size(); i++) {
                ProductImage img = new ProductImage(product, request.getImages().get(i), i + 1, i == 0);
                product.addImage(img);
            }
        }

        Product saved = productRepository.save(product);
        return ProductResponse.fromEntity(saved);
    }

    @Transactional
    public ProductResponse updateProduct(String id, CreateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        if (request.getCategoryId() != null && !request.getCategoryId().equals(product.getCategory().getId())) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
            product.setCategory(category);
        }

        product.setName(request.getName());
        product.setPrice(request.getPrice());
        if (request.getOriginalPrice() != null) {
            product.setOriginalPrice(request.getOriginalPrice());
        }
        product.setSize(request.getSize());
        product.setMaterial(request.getMaterial());
        product.setFrameShape(request.getFrameShape());
        product.setGender(request.getGender());
        if (request.getDescription() != null) {
            product.setDescription(request.getDescription());
        }
        if (request.getInStock() != null) {
            product.setInStock(request.getInStock());
        }
        if (request.getFeatured() != null) {
            product.setFeatured(request.getFeatured());
        }

        Product updated = productRepository.save(product);
        return ProductResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteProduct(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        product.setStatus("ARCHIVED");
        productRepository.save(product);
    }

    private Specification<Product> buildSpecification(ProductFilterCriteria criteria) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Status filter: only active products
            predicates.add(cb.equal(root.get("status"), "ACTIVE"));

            // Category filter
            if (criteria.getCategory() != null && !criteria.getCategory().isBlank() && !"All".equalsIgnoreCase(criteria.getCategory())) {
                String catLower = criteria.getCategory().trim().toLowerCase(Locale.ROOT);
                Predicate nameMatch = cb.equal(cb.lower(root.get("category").get("name")), catLower);
                Predicate slugMatch = cb.equal(cb.lower(root.get("category").get("slug")), catLower);
                predicates.add(cb.or(nameMatch, slugMatch));
            }

            // Gender filter
            if (criteria.getGender() != null && !criteria.getGender().isBlank() && !"All".equalsIgnoreCase(criteria.getGender())) {
                predicates.add(cb.equal(cb.lower(root.get("gender")), criteria.getGender().trim().toLowerCase(Locale.ROOT)));
            }

            // Frame Shape filter
            if (criteria.getFrameShape() != null && !criteria.getFrameShape().isBlank() && !"All".equalsIgnoreCase(criteria.getFrameShape())) {
                predicates.add(cb.equal(cb.lower(root.get("frameShape")), criteria.getFrameShape().trim().toLowerCase(Locale.ROOT)));
            }

            // Material filter
            if (criteria.getMaterial() != null && !criteria.getMaterial().isBlank() && !"All".equalsIgnoreCase(criteria.getMaterial())) {
                predicates.add(cb.equal(cb.lower(root.get("material")), criteria.getMaterial().trim().toLowerCase(Locale.ROOT)));
            }

            // Size filter
            if (criteria.getSize() != null && !criteria.getSize().isBlank() && !"All".equalsIgnoreCase(criteria.getSize())) {
                predicates.add(cb.equal(cb.lower(root.get("size")), criteria.getSize().trim().toLowerCase(Locale.ROOT)));
            }

            // Min Price
            if (criteria.getMinPrice() != null && criteria.getMinPrice().compareTo(BigDecimal.ZERO) >= 0) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), criteria.getMinPrice()));
            }

            // Max Price
            if (criteria.getMaxPrice() != null && criteria.getMaxPrice().compareTo(BigDecimal.ZERO) > 0) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), criteria.getMaxPrice()));
            }

            // Search query (name, description, frameShape, material)
            if (criteria.getSearchQuery() != null && !criteria.getSearchQuery().isBlank()) {
                String pattern = "%" + criteria.getSearchQuery().trim().toLowerCase(Locale.ROOT) + "%";
                Predicate nameLike = cb.like(cb.lower(root.get("name")), pattern);
                Predicate descLike = cb.like(cb.lower(root.get("description")), pattern);
                Predicate shapeLike = cb.like(cb.lower(root.get("frameShape")), pattern);
                Predicate matLike = cb.like(cb.lower(root.get("material")), pattern);
                predicates.add(cb.or(nameLike, descLike, shapeLike, matLike));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private Sort buildSort(String sortBy) {
        if (sortBy == null) {
            return Sort.by(Sort.Direction.DESC, "isFeatured").and(Sort.by(Sort.Direction.DESC, "rating"));
        }
        return switch (sortBy.toLowerCase(Locale.ROOT)) {
            case "price-low" -> Sort.by(Sort.Direction.ASC, "price");
            case "price-high" -> Sort.by(Sort.Direction.DESC, "price");
            case "rating" -> Sort.by(Sort.Direction.DESC, "rating");
            case "newest" -> Sort.by(Sort.Direction.DESC, "createdAt");
            default -> Sort.by(Sort.Direction.DESC, "isFeatured").and(Sort.by(Sort.Direction.DESC, "rating"));
        };
    }
}
