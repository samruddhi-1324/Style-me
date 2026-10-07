package com.styleme.review.repository;

import com.styleme.review.entity.Review;
import com.styleme.review.entity.ReviewStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReviewRepository extends JpaRepository<Review, UUID> {

    Page<Review> findByProductIdAndStatus(String productId, ReviewStatus status, Pageable pageable);

    Page<Review> findByCustomerIdAndStatus(UUID customerId, ReviewStatus status, Pageable pageable);

    Page<Review> findByStatus(ReviewStatus status, Pageable pageable);

    Page<Review> findByProductId(String productId, Pageable pageable);

    List<Review> findByProductIdAndStatus(String productId, ReviewStatus status);

    boolean existsByProductIdAndCustomerId(String productId, UUID customerId);

    long countByProductIdAndStatus(String productId, ReviewStatus status);
}
