package com.styleme.shipment.repository;

import com.styleme.shipment.entity.Shipment;
import com.styleme.shipment.entity.ShipmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface ShipmentRepository extends JpaRepository<Shipment, String> {

    /** Fetch the shipment for a given order ID. */
    Optional<Shipment> findByOrderId(String orderId);

    /** Check if a shipment already exists for an order (prevents duplicate shipment creation). */
    boolean existsByOrderId(String orderId);

    /** Fetch shipment for a given order owned by a specific customer (authorization guard). */
    @Query("""
            SELECT s FROM Shipment s
            WHERE s.order.id = :orderId
              AND s.order.customer.user.id = :userId
            """)
    Optional<Shipment> findByOrderIdAndCustomerUserId(
            @Param("orderId") String orderId,
            @Param("userId") UUID userId);

    /** Find by tracking reference (for carrier webhook integration). */
    Optional<Shipment> findByTrackingReference(String trackingReference);

    /** Count shipments in a given status (for admin dashboards). */
    long countByStatus(ShipmentStatus status);
}
