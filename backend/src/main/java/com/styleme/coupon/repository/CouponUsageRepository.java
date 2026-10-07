package com.styleme.coupon.repository;

import com.styleme.coupon.entity.CouponUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface CouponUsageRepository extends JpaRepository<CouponUsage, Long> {

    long countByCouponId(Long couponId);

    long countByCouponIdAndCustomerId(@Param("couponId") Long couponId,
                                      @Param("customerId") UUID customerId);

    @Query("SELECT u FROM CouponUsage u WHERE u.coupon.id = :couponId AND u.customer.id = :customerId")
    java.util.List<CouponUsage> findByCouponIdAndCustomerId(@Param("couponId") Long couponId,
                                                             @Param("customerId") UUID customerId);
}
