package com.styleme.product.controller;

import com.styleme.category.entity.Category;
import com.styleme.category.repository.CategoryRepository;
import com.styleme.product.entity.Product;
import com.styleme.product.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProductControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    private Category eyeglassesCategory;

    @BeforeEach
    void setUp() {
        productRepository.deleteAll();
        categoryRepository.deleteAll();

        eyeglassesCategory = categoryRepository.save(
                new Category("Eyeglasses", "eyeglasses", "Premium optical frames", 1)
        );

        Product p = new Product("frame-001", "SKU-001", "Willow Tortoise", eyeglassesCategory, new BigDecimal("3299.00"));
        p.setSize("Medium");
        p.setMaterial("Acetate");
        p.setFrameShape("Rectangle");
        p.setGender("Unisex");
        p.setFeatured(true);
        p.setStatus("ACTIVE");
        productRepository.save(p);
    }

    @Test
    @DisplayName("GET /api/v1/products returns 200 OK with paginated product list")
    void testGetAllProducts() throws Exception {
        mockMvc.perform(get("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.items").isArray())
                .andExpect(jsonPath("$.data.totalCount").value(1))
                .andExpect(jsonPath("$.data.items[0].id").value("frame-001"))
                .andExpect(jsonPath("$.data.items[0].name").value("Willow Tortoise"));
    }

    @Test
    @DisplayName("GET /api/v1/products/{id} returns 200 OK with product detail")
    void testGetProductById() throws Exception {
        mockMvc.perform(get("/api/v1/products/frame-001")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value("frame-001"))
                .andExpect(jsonPath("$.data.name").value("Willow Tortoise"))
                .andExpect(jsonPath("$.data.category").value("Eyeglasses"))
                .andExpect(jsonPath("$.data.price").value(3299.00));
    }

    @Test
    @DisplayName("GET /api/v1/products/{id} returns 404 for unknown product")
    void testGetProductByIdNotFound() throws Exception {
        mockMvc.perform(get("/api/v1/products/nonexistent-id")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("RESOURCE_NOT_FOUND"));
    }

    @Test
    @DisplayName("GET /api/v1/products/featured returns 200 OK with featured products")
    void testGetFeaturedProducts() throws Exception {
        mockMvc.perform(get("/api/v1/products/featured")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].featured").value(true));
    }

    @Test
    @DisplayName("GET /api/v1/categories returns 200 OK with category list")
    void testGetAllCategories() throws Exception {
        mockMvc.perform(get("/api/v1/categories")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].name").value("Eyeglasses"))
                .andExpect(jsonPath("$.data[0].slug").value("eyeglasses"));
    }
}
