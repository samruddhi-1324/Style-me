package com.styleme.coupon.service;

import com.styleme.common.exception.BadRequestException;
import com.styleme.common.exception.ConflictException;
import com.styleme.coupon.dto.CouponValidationRequest;
import com.styleme.coupon.dto.CouponValidationResponse;
import com.styleme.coupon.dto.CreateCouponRequest;
import com.styleme.coupon.entity.Coupon;
import com.styleme.coupon.entity.DiscountType;
import com.styleme.coupon.repository.CouponRepository;
import com.styleme.coupon.repository.CouponUsageRepository;
import com.styleme.customer.repository.CustomerRepository;
import com.styleme.product.repository.ProductRepository;
import com.styleme.category.repository.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CouponService Tests")
class CouponServiceTests {

    @Mock private CouponRepository couponRepository;
    @Mock private CouponUsageRepository couponUsageRepository;
    @Mock private CustomerRepository customerRepository;
    @Mock private ProductRepository productRepository;
    @Mock private CategoryRepository categoryRepository;

    @InjectMocks
    private CouponService couponService;

    private UUID customerId;

    @BeforeEach
    void setUp() {
        customerId = UUID.randomUUID();
    }

    // -----------------------------------------------------------------------
    // Helper: Build a standard active coupon
    // -----------------------------------------------------------------------

    private Coupon buildCoupon(DiscountType type, BigDecimal value) {
        Coupon c = new Coupon();
        c.setId(1L);
        c.setCode("SAVE10");
        c.setDiscountType(type);
        c.setDiscountValue(value);
        c.setMinOrderValue(new BigDecimal("500.00"));
        c.setMaxUses(100);
        c.setMaxUsesPerUser(1);
        c.setCurrentUses(0);
        c.setActive(true);
        c.setValidFrom(Instant.now().minus(1, ChronoUnit.DAYS));
        c.setValidUntil(Instant.now().plus(30, ChronoUnit.DAYS));
        c.setProductRestrictions(new HashSet<>());
        c.setCategoryRestrictions(new HashSet<>());
        return c;
    }

    private CouponValidationRequest buildRequest(BigDecimal subtotal) {
        CouponValidationRequest req = new CouponValidationRequest();
        req.setCouponCode("SAVE10");
        req.setOrderSubtotal(subtotal);
        req.setCartProductIds(List.of("prod-1", "prod-2"));
        return req;
    }

    // -----------------------------------------------------------------------
    // Test 1: Valid percentage coupon applies correct discount
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("Valid PERCENTAGE coupon returns correct discount")
    void testValidPercentageCoupon() {
        Coupon coupon = buildCoupon(DiscountType.PERCENTAGE, new BigDecimal("10"));
        when(couponRepository.findByCodeIgnoreCase("SAVE10")).thenReturn(Optional.of(coupon));
        when(couponUsageRepository.countByCouponIdAndCustomerId(1L, customerId)).thenReturn(0L);

        CouponValidationResponse result = couponService.validateCoupon(buildRequest(new BigDecimal("1000.00")), customerId);

        assertThat(result.isValid()).isTrue();
        // 10% of 1000 = 100
        assertThat(result.getDiscountAmount()).isEqualByComparingTo("100.00");
        assertThat(result.getCouponCode()).isEqualTo("SAVE10");
    }

    // -----------------------------------------------------------------------
    // Test 2: Percentage coupon respects maxDiscountAmount cap
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("PERCENTAGE coupon discount is capped by maxDiscountAmount")
    void testPercentageCouponCap() {
        Coupon coupon = buildCoupon(DiscountType.PERCENTAGE, new BigDecimal("20"));
        coupon.setMaxDiscountAmount(new BigDecimal("150.00"));
        when(couponRepository.findByCodeIgnoreCase("SAVE10")).thenReturn(Optional.of(coupon));
        when(couponUsageRepository.countByCouponIdAndCustomerId(1L, customerId)).thenReturn(0L);

        // 20% of 2000 = 400, but capped at 150
        CouponValidationResponse result = couponService.validateCoupon(buildRequest(new BigDecimal("2000.00")), customerId);

        assertThat(result.isValid()).isTrue();
        assertThat(result.getDiscountAmount()).isEqualByComparingTo("150.00");
    }

    // -----------------------------------------------------------------------
    // Test 3: Valid FIXED coupon
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("Valid FIXED coupon returns flat discount")
    void testValidFixedCoupon() {
        Coupon coupon = buildCoupon(DiscountType.FIXED, new BigDecimal("200.00"));
        when(couponRepository.findByCodeIgnoreCase("SAVE10")).thenReturn(Optional.of(coupon));
        when(couponUsageRepository.countByCouponIdAndCustomerId(1L, customerId)).thenReturn(0L);

        CouponValidationResponse result = couponService.validateCoupon(buildRequest(new BigDecimal("800.00")), customerId);

        assertThat(result.isValid()).isTrue();
        assertThat(result.getDiscountAmount()).isEqualByComparingTo("200.00");
    }

    // -----------------------------------------------------------------------
    // Test 4: FIXED coupon cannot produce discount exceeding subtotal
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("FIXED coupon discount cannot exceed subtotal")
    void testFixedCouponDoesNotExceedSubtotal() {
        Coupon coupon = buildCoupon(DiscountType.FIXED, new BigDecimal("1000.00"));
        coupon.setMinOrderValue(BigDecimal.ZERO);
        when(couponRepository.findByCodeIgnoreCase("SAVE10")).thenReturn(Optional.of(coupon));
        when(couponUsageRepository.countByCouponIdAndCustomerId(1L, customerId)).thenReturn(0L);

        CouponValidationResponse result = couponService.validateCoupon(buildRequest(new BigDecimal("300.00")), customerId);

        assertThat(result.isValid()).isTrue();
        // Discount capped at subtotal
        assertThat(result.getDiscountAmount()).isEqualByComparingTo("300.00");
    }

    // -----------------------------------------------------------------------
    // Test 5: Expired coupon is rejected
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("Expired coupon is rejected")
    void testExpiredCoupon() {
        Coupon coupon = buildCoupon(DiscountType.PERCENTAGE, new BigDecimal("10"));
        coupon.setValidUntil(Instant.now().minus(1, ChronoUnit.HOURS));
        when(couponRepository.findByCodeIgnoreCase("SAVE10")).thenReturn(Optional.of(coupon));

        CouponValidationResponse result = couponService.validateCoupon(buildRequest(new BigDecimal("800.00")), customerId);

        assertThat(result.isValid()).isFalse();
        assertThat(result.getMessage()).containsIgnoringCase("expired");
    }

    // -----------------------------------------------------------------------
    // Test 6: Coupon not yet valid (future start date)
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("Future-dated coupon is rejected")
    void testFutureCoupon() {
        Coupon coupon = buildCoupon(DiscountType.PERCENTAGE, new BigDecimal("10"));
        coupon.setValidFrom(Instant.now().plus(2, ChronoUnit.DAYS));
        when(couponRepository.findByCodeIgnoreCase("SAVE10")).thenReturn(Optional.of(coupon));

        CouponValidationResponse result = couponService.validateCoupon(buildRequest(new BigDecimal("800.00")), customerId);

        assertThat(result.isValid()).isFalse();
        assertThat(result.getMessage()).containsIgnoringCase("not yet valid");
    }

    // -----------------------------------------------------------------------
    // Test 7: Minimum order value not met
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("Coupon rejected when order subtotal is below minimum")
    void testMinOrderValueNotMet() {
        Coupon coupon = buildCoupon(DiscountType.PERCENTAGE, new BigDecimal("10"));
        // minOrderValue = 500, sending 300
        when(couponRepository.findByCodeIgnoreCase("SAVE10")).thenReturn(Optional.of(coupon));

        CouponValidationResponse result = couponService.validateCoupon(buildRequest(new BigDecimal("300.00")), customerId);

        assertThat(result.isValid()).isFalse();
        assertThat(result.getMessage()).containsIgnoringCase("Minimum order value");
    }

    // -----------------------------------------------------------------------
    // Test 8: Global usage limit reached
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("Coupon rejected when global usage limit is reached")
    void testGlobalUsageLimitReached() {
        Coupon coupon = buildCoupon(DiscountType.PERCENTAGE, new BigDecimal("10"));
        coupon.setMaxUses(50);
        coupon.setCurrentUses(50); // already exhausted
        when(couponRepository.findByCodeIgnoreCase("SAVE10")).thenReturn(Optional.of(coupon));

        CouponValidationResponse result = couponService.validateCoupon(buildRequest(new BigDecimal("800.00")), customerId);

        assertThat(result.isValid()).isFalse();
        assertThat(result.getMessage()).containsIgnoringCase("usage limit");
    }

    // -----------------------------------------------------------------------
    // Test 9: Per-user usage limit reached
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("Coupon rejected when per-user usage limit is reached")
    void testPerUserUsageLimitReached() {
        Coupon coupon = buildCoupon(DiscountType.PERCENTAGE, new BigDecimal("10"));
        coupon.setMaxUsesPerUser(1);
        when(couponRepository.findByCodeIgnoreCase("SAVE10")).thenReturn(Optional.of(coupon));
        // User already used it once
        when(couponUsageRepository.countByCouponIdAndCustomerId(1L, customerId)).thenReturn(1L);

        CouponValidationResponse result = couponService.validateCoupon(buildRequest(new BigDecimal("800.00")), customerId);

        assertThat(result.isValid()).isFalse();
        assertThat(result.getMessage()).containsIgnoringCase("already used");
    }

    // -----------------------------------------------------------------------
    // Test 10: Non-existent coupon code
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("Non-existent coupon code returns invalid response")
    void testNonExistentCoupon() {
        when(couponRepository.findByCodeIgnoreCase("BADCODE")).thenReturn(Optional.empty());

        CouponValidationRequest req = new CouponValidationRequest();
        req.setCouponCode("BADCODE");
        req.setOrderSubtotal(new BigDecimal("800.00"));

        CouponValidationResponse result = couponService.validateCoupon(req, customerId);

        assertThat(result.isValid()).isFalse();
        assertThat(result.getMessage()).containsIgnoringCase("not found");
    }

    // -----------------------------------------------------------------------
    // Test 11: Inactive coupon is rejected
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("Inactive coupon is rejected")
    void testInactiveCoupon() {
        Coupon coupon = buildCoupon(DiscountType.FIXED, new BigDecimal("100"));
        coupon.setActive(false);
        when(couponRepository.findByCodeIgnoreCase("SAVE10")).thenReturn(Optional.of(coupon));

        CouponValidationResponse result = couponService.validateCoupon(buildRequest(new BigDecimal("800.00")), customerId);

        assertThat(result.isValid()).isFalse();
        assertThat(result.getMessage()).containsIgnoringCase("not active");
    }

    // -----------------------------------------------------------------------
    // Test 12: Duplicate coupon code rejected at create time
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("Creating duplicate coupon code throws ConflictException")
    void testDuplicateCouponCodeThrows() {
        Coupon existing = buildCoupon(DiscountType.FIXED, new BigDecimal("50"));
        when(couponRepository.findByCodeIgnoreCase("SAVE10")).thenReturn(Optional.of(existing));

        CreateCouponRequest req = new CreateCouponRequest();
        req.setCode("SAVE10");
        req.setDiscountType(DiscountType.FIXED);
        req.setDiscountValue(new BigDecimal("50"));
        req.setValidFrom(Instant.now());

        assertThatThrownBy(() -> couponService.createCoupon(req))
                .isInstanceOf(ConflictException.class);
    }
}
