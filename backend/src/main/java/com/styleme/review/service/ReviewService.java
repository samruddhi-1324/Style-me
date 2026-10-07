package com.styleme.review.service;

import com.styleme.common.exception.BadRequestException;
import com.styleme.common.exception.ConflictException;
import com.styleme.common.exception.ResourceNotFoundException;
import com.styleme.customer.entity.Customer;
import com.styleme.customer.repository.CustomerRepository;
import com.styleme.order.entity.Order;
import com.styleme.order.entity.OrderItem;
import com.styleme.order.entity.OrderStatus;
import com.styleme.order.repository.OrderRepository;
import com.styleme.product.entity.Product;
import com.styleme.product.repository.ProductRepository;
import com.styleme.review.dto.*;
import com.styleme.review.entity.Review;
import com.styleme.review.entity.ReviewStatus;
import com.styleme.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;

    @Transactional
    public ReviewResponse createReview(UUID customerId, CreateReviewRequest request) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (reviewRepository.existsByProductIdAndCustomerId(product.getId(), customerId)) {
            throw new ConflictException("A review for this product already exists for this customer");
        }

        boolean verifiedPurchase = hasDeliveredOrderForProduct(customerId, product.getId());
        if (!verifiedPurchase) {
            throw new BadRequestException("Only verified purchasers can submit a review for this product");
        }

        Order order = findDeliveredOrderForProduct(customerId, product.getId());

        Review review = new Review();
        review.setProduct(product);
        review.setCustomer(customer);
        review.setOrder(order);
        review.setRating(request.rating());
        review.setTitle(request.title());
        review.setComment(request.comment());
        review.setVerifiedPurchase(true);
        review.setStatus(ReviewStatus.APPROVED);

        Review saved = reviewRepository.save(review);
        refreshProductRating(product.getId());

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<ReviewResponse> getProductReviews(String productId, Pageable pageable) {
        return reviewRepository.findByProductIdAndStatus(productId, ReviewStatus.APPROVED, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public ReviewSummaryResponse getProductReviewSummary(String productId) {
        List<Review> approved = reviewRepository.findByProductIdAndStatus(productId, ReviewStatus.APPROVED);

        long total = approved.size();
        long fiveStar = approved.stream().filter(r -> r.getRating() == 5).count();
        long fourStar = approved.stream().filter(r -> r.getRating() == 4).count();
        long threeStar = approved.stream().filter(r -> r.getRating() == 3).count();
        long twoStar = approved.stream().filter(r -> r.getRating() == 2).count();
        long oneStar = approved.stream().filter(r -> r.getRating() == 1).count();

        BigDecimal average = total == 0
                ? BigDecimal.ZERO
                : BigDecimal.valueOf(approved.stream().mapToDouble(Review::getRating).average().orElse(0.0))
                    .setScale(2, RoundingMode.HALF_UP);

        return new ReviewSummaryResponse(productId, average, total, fiveStar, fourStar, threeStar, twoStar, oneStar);
    }

    @Transactional(readOnly = true)
    public Page<ReviewResponse> getCustomerReviews(UUID customerId, Pageable pageable) {
        return reviewRepository.findByCustomerIdAndStatus(customerId, ReviewStatus.APPROVED, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<ReviewResponse> getPendingReviews(Pageable pageable) {
        return reviewRepository.findByStatus(ReviewStatus.PENDING, pageable)
                .map(this::toResponse);
    }

    @Transactional
    public ReviewResponse moderateReview(UUID reviewId, ModerationRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        review.setStatus(request.status());
        review.setModerationNote(request.moderationNote());
        review.setUpdatedAt(java.time.Instant.now());

        Review saved = reviewRepository.save(review);
        refreshProductRating(review.getProduct().getId());
        return toResponse(saved);
    }

    @Transactional
    public void deleteMyReview(UUID customerId, UUID reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        if (!review.getCustomer().getId().equals(customerId)) {
            throw new BadRequestException("You can only delete your own review");
        }

        review.setStatus(ReviewStatus.HIDDEN);
        review.setModerationNote("Customer deleted review");
        reviewRepository.save(review);
        refreshProductRating(review.getProduct().getId());
    }

    private boolean hasDeliveredOrderForProduct(UUID customerId, String productId) {
        return findDeliveredOrderForProduct(customerId, productId) != null;
    }

    private Order findDeliveredOrderForProduct(UUID customerId, String productId) {
        Page<Order> orders = orderRepository.findByCustomerIdOrderByPlacedAtDesc(customerId, Pageable.unpaged());
        for (Order order : orders.getContent()) {
            if (order.getStatus() == OrderStatus.DELIVERED) {
                for (OrderItem item : order.getItems()) {
                    if (item.getProductId().equals(productId)) {
                        return order;
                    }
                }
            }
        }
        return null;
    }

    private void refreshProductRating(String productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        List<Review> approved = reviewRepository.findByProductIdAndStatus(productId, ReviewStatus.APPROVED);
        long total = approved.size();
        BigDecimal average = total == 0
                ? BigDecimal.ZERO
                : BigDecimal.valueOf(approved.stream().mapToDouble(Review::getRating).average().orElse(0.0))
                    .setScale(2, RoundingMode.HALF_UP);

        product.setRating(average);
        product.setReviewCount(Math.toIntExact(total));
        productRepository.save(product);
    }

    private ReviewResponse toResponse(Review review) {
        return new ReviewResponse(
                review.getId(),
                review.getProduct().getId(),
                review.getCustomer().getId(),
                review.getCustomer().getUser().getFirstName() + " " + review.getCustomer().getUser().getLastName(),
                review.getOrder() != null ? review.getOrder().getId() : null,
                review.getRating(),
                review.getTitle(),
                review.getComment(),
                review.isVerifiedPurchase(),
                review.getStatus(),
                review.getModerationNote(),
                review.getCreatedAt(),
                review.getUpdatedAt()
        );
    }
}
