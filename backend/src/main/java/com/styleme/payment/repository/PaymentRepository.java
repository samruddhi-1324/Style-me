package com.styleme.payment.repository;

import com.styleme.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, String> {
    Optional<Payment> findByIdAndCustomerId(String id, UUID customerId);
    Optional<Payment> findByOrderId(String orderId);
    Optional<Payment> findByIdempotencyKey(String idempotencyKey);
}
