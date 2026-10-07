package com.styleme.order.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CheckoutRequest {

    private String couponCode;

    @NotBlank(message = "Shipping name is required")
    private String shippingName;

    private String shippingPhone;

    @NotBlank(message = "Shipping address line 1 is required")
    private String shippingLine1;

    private String shippingLine2;

    @NotBlank(message = "Shipping city is required")
    private String shippingCity;

    @NotBlank(message = "Shipping state is required")
    private String shippingState;

    @NotBlank(message = "Shipping postal code is required")
    private String shippingPostal;

    @NotBlank(message = "Shipping country is required")
    private String shippingCountry;

    private String notes;
}
