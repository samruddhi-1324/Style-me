package com.styleme.coupon.service;

import com.styleme.category.entity.Category;
import com.styleme.common.exception.BadRequestException;
import com.styleme.common.exception.ConflictException;
import com.styleme.common.exception.ResourceNotFoundException;
import com.styleme.coupon.dto.*;
import com.styleme.coupon.entity.Coupon;
import com.styleme.coupon.entity.CouponUsage;
import com.styleme.coupon.entity.DiscountType;
import com.styleme.coupon.repository.CouponRepository;
import com.styleme.coupon.repository.CouponUsageRepository;
import com.styleme.customer.entity.Customer;
import com.styleme.customer.repository.CustomerRepository;
import com.styleme.product.entity.Product;
import com.styleme.product.repository.ProductRepository;
import com.styleme.category.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Coupon validation engine.
 * SRS Section 101: Backend must validate all coupon rules.
 * Frontend coupon validation is informational only.
 */
@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    // -----------------------------------------------------------------------
    // Admin CRUD
    // -----------------------------------------------------------------------

    @Transactional
    public CouponResponse createCoupon(CreateCouponRequest req) {
        if (couponRepository.findByCodeIgnoreCase(req.getCode()).isPresent()) {
            throw new ConflictException("Coupon code already exists: " + req.getCode());
        }
        if (req.getDiscountType() == DiscountType.PERCENTAGE
                && req.getDiscountValue().compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new BadRequestException("Percentage discount cannot exceed 100%");
        }
        if (req.getValidUntil() != null && req.getValidUntil().isBefore(req.getValidFrom())) {
            throw new BadRequestException("validUntil must be after validFrom");
        }

        Coupon coupon = new Coupon();
        mapRequestToEntity(req, coupon);
        coupon = couponRepository.save(coupon);
        return toResponse(coupon);
    }

    @Transactional(readOnly = true)
    public CouponResponse getCoupon(Long id) {
        return toResponse(findById(id));
    }

    @Transactional(readOnly = true)
    public List<CouponResponse> getAllCoupons() {
        return couponRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public CouponResponse updateCoupon(Long id, CreateCouponRequest req) {
        Coupon coupon = findById(id);
        // Allow code change only if not colliding with another coupon
        couponRepository.findByCodeIgnoreCase(req.getCode())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new ConflictException("Coupon code already in use: " + req.getCode());
                    }
                });
        mapRequestToEntity(req, coupon);
        return toResponse(couponRepository.save(coupon));
    }

    @Transactional
    public void deactivateCoupon(Long id) {
        Coupon coupon = findById(id);
        coupon.setActive(false);
        couponRepository.save(coupon);
    }

    @Transactional
    public void deleteCoupon(Long id) {
        if (!couponRepository.existsById(id)) {
            throw new ResourceNotFoundException("Coupon not found: " + id);
        }
        couponRepository.deleteById(id);
    }

    // -----------------------------------------------------------------------
    // Customer Validation (SRS Section 101)
    // -----------------------------------------------------------------------

    /**
     * Validates all SRS Section 101 rules and returns the authoritative discount amount.
     * This is informational — the discount is confirmed/recorded at checkout.
     */
    @Transactional(readOnly = true)
    public CouponValidationResponse validateCoupon(CouponValidationRequest req, UUID customerId) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(req.getCouponCode())
                .orElse(null);

        if (coupon == null) {
            return invalid("Coupon code not found");
        }

        // 1. Active status
        if (!coupon.isActive()) {
            return invalid("Coupon is not active");
        }

        // 2. Start date
        Instant now = Instant.now();
        if (now.isBefore(coupon.getValidFrom())) {
            return invalid("Coupon is not yet valid");
        }

        // 3. Expiry date
        if (coupon.getValidUntil() != null && now.isAfter(coupon.getValidUntil())) {
            return invalid("Coupon has expired");
        }

        // 4. Minimum order value
        if (req.getOrderSubtotal().compareTo(coupon.getMinOrderValue()) < 0) {
            return invalid(String.format(
                    "Minimum order value of ₹%.2f required", coupon.getMinOrderValue()));
        }

        // 5. Global usage limit
        if (coupon.getMaxUses() != null && coupon.getCurrentUses() >= coupon.getMaxUses()) {
            return invalid("Coupon usage limit has been reached");
        }

        // 6. Per-user usage limit
        long userUses = couponUsageRepository.countByCouponIdAndCustomerId(coupon.getId(), customerId);
        if (userUses >= coupon.getMaxUsesPerUser()) {
            return invalid("You have already used this coupon the maximum number of times");
        }

        // 7. Product restrictions
        if (!coupon.getProductRestrictions().isEmpty()) {
            List<String> cartProductIds = req.getCartProductIds();
            if (cartProductIds == null || cartProductIds.isEmpty()) {
                return invalid("This coupon is only valid for specific products not in your cart");
            }
            Set<String> restrictedIds = coupon.getProductRestrictions().stream()
                    .map(Product::getId).collect(Collectors.toSet());
            boolean hasEligibleProduct = cartProductIds.stream().anyMatch(restrictedIds::contains);
            if (!hasEligibleProduct) {
                return invalid("This coupon does not apply to the products in your cart");
            }
        }

        // 8. Category restrictions
        if (!coupon.getCategoryRestrictions().isEmpty()) {
            List<String> cartProductIds = req.getCartProductIds();
            if (cartProductIds == null || cartProductIds.isEmpty()) {
                return invalid("This coupon is only valid for specific categories not in your cart");
            }
            Set<Integer> restrictedCategoryIds = coupon.getCategoryRestrictions().stream()
                    .map(Category::getId).collect(Collectors.toSet());
            // Load categories for cart products
            List<Product> cartProducts = productRepository.findAllById(cartProductIds);
            boolean hasEligibleCategory = cartProducts.stream()
                    .anyMatch(p -> p.getCategory() != null
                            && restrictedCategoryIds.contains(p.getCategory().getId()));
            if (!hasEligibleCategory) {
                return invalid("This coupon does not apply to the categories in your cart");
            }
        }

        // All checks passed — calculate discount
        BigDecimal discount = calculateDiscount(coupon, req.getOrderSubtotal());

        return CouponValidationResponse.builder()
                .valid(true)
                .couponCode(coupon.getCode())
                .discountType(coupon.getDiscountType())
                .discountAmount(discount)
                .message(String.format("Coupon applied! You save ₹%.2f", discount))
                .build();
    }

    /**
     * Records a coupon redemption after a successful order.
     * Called by OrderService at checkout (Phase 7).
     * SRS Section 101: Usage limits enforced at record time.
     */
    @Transactional
    public void recordRedemption(String couponCode, UUID customerId, BigDecimal discountApplied, String orderId) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(couponCode)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found: " + couponCode));
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + customerId));

        // Re-validate limit at record time (prevents race conditions at checkout)
        if (coupon.getMaxUses() != null && coupon.getCurrentUses() >= coupon.getMaxUses()) {
            throw new BadRequestException("Coupon usage limit exceeded");
        }
        long userUses = couponUsageRepository.countByCouponIdAndCustomerId(coupon.getId(), customerId);
        if (userUses >= coupon.getMaxUsesPerUser()) {
            throw new BadRequestException("Per-user coupon limit exceeded");
        }

        CouponUsage usage = new CouponUsage(coupon, customer, discountApplied);
        usage.setOrderId(orderId);
        couponUsageRepository.save(usage);

        coupon.setCurrentUses(coupon.getCurrentUses() + 1);
        couponRepository.save(coupon);
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    /**
     * Calculate the authoritative discount for a given coupon and subtotal.
     * SRS Section 100: All pricing is backend-authoritative.
     */
    public BigDecimal calculateDiscount(Coupon coupon, BigDecimal subtotal) {
        BigDecimal discount;
        if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
            discount = subtotal
                    .multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            // Apply cap if set
            if (coupon.getMaxDiscountAmount() != null) {
                discount = discount.min(coupon.getMaxDiscountAmount());
            }
        } else {
            // FIXED — cannot exceed the subtotal
            discount = coupon.getDiscountValue().min(subtotal);
        }
        return discount.setScale(2, RoundingMode.HALF_UP);
    }

    private CouponValidationResponse invalid(String reason) {
        return CouponValidationResponse.builder()
                .valid(false)
                .message(reason)
                .discountAmount(BigDecimal.ZERO)
                .build();
    }

    private Coupon findById(Long id) {
        return couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found: " + id));
    }

    private void mapRequestToEntity(CreateCouponRequest req, Coupon coupon) {
        coupon.setCode(req.getCode().toUpperCase());
        coupon.setDescription(req.getDescription());
        coupon.setDiscountType(req.getDiscountType());
        coupon.setDiscountValue(req.getDiscountValue());
        coupon.setMaxDiscountAmount(req.getMaxDiscountAmount());
        coupon.setMinOrderValue(req.getMinOrderValue() != null ? req.getMinOrderValue() : BigDecimal.ZERO);
        coupon.setMaxUses(req.getMaxUses());
        coupon.setMaxUsesPerUser(req.getMaxUsesPerUser());
        coupon.setValidFrom(req.getValidFrom());
        coupon.setValidUntil(req.getValidUntil());

        // Product restrictions
        Set<Product> products = new HashSet<>();
        if (req.getProductIds() != null && !req.getProductIds().isEmpty()) {
            products.addAll(productRepository.findAllById(req.getProductIds()));
        }
        coupon.setProductRestrictions(products);

        // Category restrictions
        Set<Category> categories = new HashSet<>();
        if (req.getCategoryIds() != null && !req.getCategoryIds().isEmpty()) {
            // Convert Long IDs to Integer for Category repository
            List<Integer> intCategoryIds = req.getCategoryIds().stream()
                    .map(Long::intValue).collect(Collectors.toList());
            categories.addAll(categoryRepository.findAllById(intCategoryIds));
        }
        coupon.setCategoryRestrictions(categories);
    }

    private CouponResponse toResponse(Coupon coupon) {
        return CouponResponse.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .description(coupon.getDescription())
                .discountType(coupon.getDiscountType())
                .discountValue(coupon.getDiscountValue())
                .maxDiscountAmount(coupon.getMaxDiscountAmount())
                .minOrderValue(coupon.getMinOrderValue())
                .maxUses(coupon.getMaxUses())
                .maxUsesPerUser(coupon.getMaxUsesPerUser())
                .currentUses(coupon.getCurrentUses())
                .active(coupon.isActive())
                .validFrom(coupon.getValidFrom())
                .validUntil(coupon.getValidUntil())
                .productIds(coupon.getProductRestrictions().stream()
                        .map(Product::getId).collect(Collectors.toList()))
                .categoryIds(coupon.getCategoryRestrictions().stream()
                        .map(c -> c.getId().longValue()).collect(Collectors.toList()))
                .createdAt(coupon.getCreatedAt())
                .updatedAt(coupon.getUpdatedAt())
                .build();
    }
}
