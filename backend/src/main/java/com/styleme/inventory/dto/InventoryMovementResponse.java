package com.styleme.inventory.dto;

import com.styleme.inventory.entity.MovementType;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
public class InventoryMovementResponse {

    private Long id;
    private Long inventoryId;
    private String sku;
    private MovementType movementType;
    private int quantityDelta;
    private int quantityBefore;
    private int quantityAfter;
    private String referenceId;
    private String referenceType;
    private String note;
    private Instant performedAt;
}
