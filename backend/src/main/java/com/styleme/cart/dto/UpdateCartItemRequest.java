package com.styleme.cart.dto;

import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateCartItemRequest {
    @Min(value = 0, message = "Quantity cannot be negative. Set to 0 to remove item.")
    private int quantity;
}
