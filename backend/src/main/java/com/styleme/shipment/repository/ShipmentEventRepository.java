package com.styleme.shipment.repository;

import com.styleme.shipment.entity.ShipmentEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ShipmentEventRepository extends JpaRepository<ShipmentEvent, String> {

    /** Return all events for a shipment, ordered by event time descending. */
    List<ShipmentEvent> findByShipmentIdOrderByOccurredAtDesc(String shipmentId);
}
