package com.styleme.admin.service;

import com.styleme.admin.dto.AdminAuditLogResponse;
import com.styleme.admin.entity.AdminAuditLog;
import com.styleme.admin.repository.AdminAuditLogRepository;
import com.styleme.cms.entity.CmsPageStatus;
import com.styleme.cms.repository.CmsPageRepository;
import com.styleme.coupon.repository.CouponRepository;
import com.styleme.customer.repository.CustomerRepository;
import com.styleme.order.repository.OrderRepository;
import com.styleme.product.repository.ProductRepository;
import com.styleme.review.entity.Review;
import com.styleme.review.entity.ReviewStatus;
import com.styleme.review.repository.ReviewRepository;
import com.styleme.returns.repository.ReturnRequestRepository;
import com.styleme.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminDashboardServiceTests {

    @Mock private UserRepository userRepository;
    @Mock private CustomerRepository customerRepository;
    @Mock private ProductRepository productRepository;
    @Mock private OrderRepository orderRepository;
    @Mock private CouponRepository couponRepository;
    @Mock private ReviewRepository reviewRepository;
    @Mock private ReturnRequestRepository returnRequestRepository;
    @Mock private CmsPageRepository cmsPageRepository;
    @Mock private AdminAuditLogRepository adminAuditLogRepository;

    private AdminDashboardService service;

    @BeforeEach
    void setUp() {
        service = new AdminDashboardService(
                userRepository,
                customerRepository,
                productRepository,
                orderRepository,
                couponRepository,
                reviewRepository,
                returnRequestRepository,
                cmsPageRepository,
                adminAuditLogRepository
        );
    }

    @Test
    void getDashboard_returnsSummaries() {
        when(userRepository.count()).thenReturn(10L);
        when(customerRepository.count()).thenReturn(8L);
        when(productRepository.count()).thenReturn(20L);
        when(orderRepository.count()).thenReturn(15L);
        when(couponRepository.count()).thenReturn(4L);
        when(returnRequestRepository.count()).thenReturn(3L);
        when(reviewRepository.count()).thenReturn(26L);
        when(cmsPageRepository.findByStatus(CmsPageStatus.PUBLISHED)).thenReturn(List.of());
        when(reviewRepository.findByStatus(eq(ReviewStatus.PENDING), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        var dashboard = service.getDashboard();

        assertEquals("HEALTHY", dashboard.get("systemStatus"));
        assertEquals(10L, dashboard.get("totalUsers"));
        assertEquals(15L, dashboard.get("totalOrders"));
        assertEquals(26L, dashboard.get("totalReviews"));
    }

    @Test
    void getAuditLogs_returnsRecentEntries() {
        AdminAuditLog log = new AdminAuditLog("VIEW_DASHBOARD", "ADMIN_DASHBOARD", "dashboard", "admin", "SUCCESS", "Dashboard examined");
        log.setId(1L);
        when(adminAuditLogRepository.findAllByOrderByCreatedAtDesc(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(log)));

        Page<AdminAuditLogResponse> logs = service.getAuditLogs(0, 10);

        assertEquals(1, logs.getTotalElements());
        assertEquals("VIEW_DASHBOARD", logs.getContent().get(0).action());
    }
}
