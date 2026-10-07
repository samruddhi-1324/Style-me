package com.styleme.inventory.repository;

import com.styleme.inventory.entity.InventoryMovement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, Long> {

    List<InventoryMovement> findByInventoryIdOrderByPerformedAtDesc(Long inventoryId);

    List<InventoryMovement> findByReferenceId(String referenceId);
}
