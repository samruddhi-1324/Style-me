package com.styleme.inventory.dto;

import com.styleme.inventory.entity.MovementType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StockAdjustmentRequest {

    @NotNull(message = "Movement type is required")
    private MovementType movementType;

    /**
     * Absolute quantity for RESTOCK / ADJUSTMENT (always positive).
     * For DAMAGED, TRANSFER, the service will negate internally.
     */
    @Min(value = 1, message = "Adjustment quantity must be at least 1")
    private int quantity;

    private String referenceId;
    private String referenceType;
    private String note;
}
