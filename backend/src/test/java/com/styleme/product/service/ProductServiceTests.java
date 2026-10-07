package com.styleme.product.service;

import com.styleme.category.entity.Category;
import com.styleme.category.repository.CategoryRepository;
import com.styleme.common.dto.PageResponse;
import com.styleme.common.exception.ResourceNotFoundException;
import com.styleme.product.dto.ProductFilterCriteria;
import com.styleme.product.dto.ProductResponse;
import com.styleme.product.entity.Product;
import com.styleme.product.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class ProductServiceTests {

    private ProductRepository productRepository;
    private CategoryRepository categoryRepository;
    private ProductService productService;

    private Category eyeglassesCategory;
    private Product sampleProduct;

    @BeforeEach
    void setUp() {
        productRepository = Mockito.mock(ProductRepository.class);
        categoryRepository = Mockito.mock(CategoryRepository.class);
        productService = new ProductService(productRepository, categoryRepository);

        eyeglassesCategory = new Category("Eyeglasses", "eyeglasses", "Premium optical frames", 1);
        eyeglassesCategory.setId(1);

        sampleProduct = new Product("frame-001", "SKU-001", "Willow Tortoise", eyeglassesCategory, new BigDecimal("3299.00"));
        sampleProduct.setSize("Medium");
        sampleProduct.setMaterial("Acetate");
        sampleProduct.setFrameShape("Rectangle");
        sampleProduct.setGender("Unisex");
        sampleProduct.setStatus("ACTIVE");
    }

    @Test
    @DisplayName("getProducts returns paginated results")
    void testGetProductsReturnsPage() {
        ProductFilterCriteria criteria = new ProductFilterCriteria();
        criteria.setPage(1);
        criteria.setPageSize(12);

        when(productRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(sampleProduct)));

        PageResponse<ProductResponse> response = productService.getProducts(criteria);

        assertNotNull(response);
        assertEquals(1, response.getItems().size());
        assertEquals("frame-001", response.getItems().get(0).getId());
        assertEquals("Willow Tortoise", response.getItems().get(0).getName());
        assertEquals(1, response.getTotalCount());
    }

    @Test
    @DisplayName("getProductById returns product details")
    void testGetProductByIdSuccess() {
        when(productRepository.findById("frame-001")).thenReturn(Optional.of(sampleProduct));

        ProductResponse response = productService.getProductById("frame-001");

        assertNotNull(response);
        assertEquals("frame-001", response.getId());
        assertEquals("Willow Tortoise", response.getName());
        assertEquals("Eyeglasses", response.getCategory());
    }

    @Test
    @DisplayName("getProductById throws ResourceNotFoundException for unknown ID")
    void testGetProductByIdNotFound() {
        when(productRepository.findById("unknown-id")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> productService.getProductById("unknown-id"));
    }

    @Test
    @DisplayName("getFeaturedProducts returns only featured active products")
    void testGetFeaturedProducts() {
        sampleProduct.setFeatured(true);
        when(productRepository.findByStatusAndIsFeaturedTrue("ACTIVE")).thenReturn(List.of(sampleProduct));

        List<ProductResponse> results = productService.getFeaturedProducts();

        assertNotNull(results);
        assertEquals(1, results.size());
        assertTrue(results.get(0).isFeatured());
    }
}
