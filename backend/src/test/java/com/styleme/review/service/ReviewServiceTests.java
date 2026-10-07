package com.styleme.review.service;

import com.styleme.category.entity.Category;
import com.styleme.common.exception.BadRequestException;
import com.styleme.customer.entity.Customer;
import com.styleme.customer.repository.CustomerRepository;
import com.styleme.order.entity.Order;
import com.styleme.order.entity.OrderItem;
import com.styleme.order.entity.OrderStatus;
import com.styleme.order.repository.OrderRepository;
import com.styleme.product.entity.Product;
import com.styleme.product.repository.ProductRepository;
import com.styleme.review.dto.CreateReviewRequest;
import com.styleme.review.dto.ModerationRequest;
import com.styleme.review.dto.ReviewResponse;
import com.styleme.review.entity.Review;
import com.styleme.review.entity.ReviewStatus;
import com.styleme.review.repository.ReviewRepository;
import com.styleme.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTests {

    @Mock private ReviewRepository reviewRepository;
    @Mock private ProductRepository productRepository;
    @Mock private CustomerRepository customerRepository;
    @Mock private OrderRepository orderRepository;

    private ReviewService reviewService;
    private Customer customer;
    private Product product;
    private Order order;

    @BeforeEach
    void setUp() {
        reviewService = new ReviewService(reviewRepository, productRepository, customerRepository, orderRepository);

        User user = new User("customer@example.com", "hash", "Test", "User");
        user.setId(UUID.randomUUID());

        customer = new Customer(user);
        customer.setId(user.getId());

        Category category = new Category();
        category.setId(1);
        category.setName("Eyewear");

        product = new Product("prod-1", "SKU-1", "Aster Frame", category, new BigDecimal("1190.00"));
        product.setReviewCount(0);
        product.setRating(BigDecimal.ZERO);

        order = new Order();
        order.setId("ord-1");
        order.setOrderNumber("SM-20261006-00001");
        order.setCustomer(customer);
        order.setStatus(OrderStatus.DELIVERED);

        OrderItem item = new OrderItem();
        item.setId(10L);
        item.setOrder(order);
        item.setProductId("prod-1");
        item.setProductName("Aster Frame");
        item.setSku("SKU-1");
        item.setUnitPrice(new BigDecimal("1190.00"));
        item.setQuantity(1);
        item.setLineTotal(new BigDecimal("1190.00"));
        order.setItems(List.of(item));
    }

    @Test
    void createReview_forVerifiedPurchase_savesReviewAndUpdatesProductSummary() {
        CreateReviewRequest request = new CreateReviewRequest("prod-1", 5, "Excellent", "Comfortable and premium");

        when(customerRepository.findById(customer.getId())).thenReturn(Optional.of(customer));
        when(productRepository.findById("prod-1")).thenReturn(Optional.of(product));
        when(reviewRepository.existsByProductIdAndCustomerId("prod-1", customer.getId())).thenReturn(false);
        when(orderRepository.findByCustomerIdOrderByPlacedAtDesc(eq(customer.getId()), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(order)));
        when(reviewRepository.save(any(Review.class))).thenAnswer(invocation -> {
            Review review = invocation.getArgument(0);
            review.setId(UUID.randomUUID());
            return review;
        });
        when(reviewRepository.findByProductIdAndStatus("prod-1", ReviewStatus.APPROVED)).thenReturn(List.of());
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ReviewResponse response = reviewService.createReview(customer.getId(), request);

        assertNotNull(response);
        assertEquals(5, response.rating());
        assertTrue(response.verifiedPurchase());
        assertEquals(ReviewStatus.APPROVED, response.status());
        verify(reviewRepository).save(any(Review.class));
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void createReview_forUnverifiedCustomer_throwsBadRequest() {
        CreateReviewRequest request = new CreateReviewRequest("prod-1", 4, "Great", "Looks sharp");

        when(customerRepository.findById(customer.getId())).thenReturn(Optional.of(customer));
        when(productRepository.findById("prod-1")).thenReturn(Optional.of(product));
        when(reviewRepository.existsByProductIdAndCustomerId("prod-1", customer.getId())).thenReturn(false);
        when(orderRepository.findByCustomerIdOrderByPlacedAtDesc(eq(customer.getId()), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        assertThrows(BadRequestException.class, () -> reviewService.createReview(customer.getId(), request));
    }

    @Test
    void moderateReview_updatesStatusAndRecalculatesProductSummary() {
        Review review = new Review();
        review.setId(UUID.randomUUID());
        review.setProduct(product);
        review.setCustomer(customer);
        review.setOrder(order);
        review.setRating(5);
        review.setComment("Excellent product");
        review.setStatus(ReviewStatus.APPROVED);
        review.setVerifiedPurchase(true);

        when(reviewRepository.findById(review.getId())).thenReturn(Optional.of(review));
        when(reviewRepository.save(any(Review.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(productRepository.findById("prod-1")).thenReturn(Optional.of(product));
        when(reviewRepository.findByProductIdAndStatus("prod-1", ReviewStatus.APPROVED)).thenReturn(List.of());
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ReviewResponse response = reviewService.moderateReview(review.getId(),
                new ModerationRequest(ReviewStatus.REJECTED, "Not aligned with brand guidelines"));

        assertEquals(ReviewStatus.REJECTED, response.status());
        verify(reviewRepository).save(any(Review.class));
        verify(productRepository).save(any(Product.class));
    }
}
