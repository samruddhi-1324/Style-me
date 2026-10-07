package com.styleme.coupon.dto;

import com.styleme.coupon.entity.DiscountType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponResponse {

    private Long id;
    private String code;
    private String description;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal maxDiscountAmount;
    private BigDecimal minOrderValue;
    private Integer maxUses;
    private int maxUsesPerUser;
    private int currentUses;
    private boolean active;
    private Instant validFrom;
    private Instant validUntil;
    private List<String> productIds;
    private List<Long> categoryIds;
    private Instant createdAt;
    private Instant updatedAt;
}
