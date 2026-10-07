package com.styleme.admin.service;

import com.styleme.admin.dto.AdminAuditLogResponse;
import com.styleme.admin.entity.AdminAuditLog;
import com.styleme.admin.repository.AdminAuditLogRepository;
import com.styleme.cms.repository.CmsPageRepository;
import com.styleme.coupon.repository.CouponRepository;
import com.styleme.customer.repository.CustomerRepository;
import com.styleme.order.repository.OrderRepository;
import com.styleme.product.repository.ProductRepository;
import com.styleme.review.entity.ReviewStatus;
import com.styleme.review.repository.ReviewRepository;
import com.styleme.returns.repository.ReturnRequestRepository;
import com.styleme.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final CouponRepository couponRepository;
    private final ReviewRepository reviewRepository;
    private final ReturnRequestRepository returnRequestRepository;
    private final CmsPageRepository cmsPageRepository;
    private final AdminAuditLogRepository adminAuditLogRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboard() {
        Map<String, Object> dashboard = new LinkedHashMap<>();
        dashboard.put("systemStatus", "HEALTHY");
        dashboard.put("generatedAt", Instant.now());
        dashboard.put("totalUsers", userRepository.count());
        dashboard.put("totalCustomers", customerRepository.count());
        dashboard.put("totalProducts", productRepository.count());
        dashboard.put("totalOrders", orderRepository.count());
        dashboard.put("totalCoupons", couponRepository.count());
        dashboard.put("totalReturns", returnRequestRepository.count());
        dashboard.put("totalReviews", reviewRepository.count());
        dashboard.put("publishedCmsPages", cmsPageRepository.findByStatus(com.styleme.cms.entity.CmsPageStatus.PUBLISHED).size());
        dashboard.put("pendingReviews", reviewRepository.findByStatus(ReviewStatus.PENDING, Pageable.unpaged()).getTotalElements());
        return dashboard;
    }

    @Transactional(readOnly = true)
    public Page<AdminAuditLogResponse> getAuditLogs(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return adminAuditLogRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::toResponse);
    }

    @Transactional
    public void recordAudit(String action, String entityType, String entityId, String performedBy, String result, String details) {
        adminAuditLogRepository.save(new AdminAuditLog(action, entityType, entityId, performedBy, result, details));
    }

    private AdminAuditLogResponse toResponse(AdminAuditLog log) {
        return new AdminAuditLogResponse(
                log.getId(),
                log.getAction(),
                log.getEntityType(),
                log.getEntityId(),
                log.getPerformedBy(),
                log.getResult(),
                log.getDetails(),
                log.getCreatedAt()
        );
    }
}
