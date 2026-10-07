package com.styleme.order.repository;

import com.styleme.order.entity.Order;
import com.styleme.order.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, String> {

    Page<Order> findByCustomerIdOrderByPlacedAtDesc(UUID customerId, Pageable pageable);

    Optional<Order> findByOrderNumber(String orderNumber);

    @Query("SELECT o FROM Order o WHERE o.id = :id AND o.customer.id = :customerId")
    Optional<Order> findByIdAndCustomerId(@Param("id") String id,
                                          @Param("customerId") UUID customerId);

    Page<Order> findByStatusOrderByPlacedAtDesc(OrderStatus status, Pageable pageable);
}
