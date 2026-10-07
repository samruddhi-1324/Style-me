package com.styleme.coupon.repository;

import com.styleme.coupon.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CouponRepository extends JpaRepository<Coupon, Long> {

    Optional<Coupon> findByCodeIgnoreCase(String code);

    @Query("SELECT COUNT(u) FROM CouponUsage u WHERE u.coupon.id = :couponId AND u.customer.id = :customerId")
    long countUsagesByCustomer(@Param("couponId") Long couponId, @Param("customerId") java.util.UUID customerId);
}
