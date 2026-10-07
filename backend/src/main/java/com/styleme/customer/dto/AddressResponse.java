package com.styleme.customer.dto;

import com.styleme.customer.entity.AddressType;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AddressResponse {
    private Long id;
    private AddressType addressType;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String line1;
    private String line2;
    private String city;
    private String state;
    private String postalCode;
    private String country;
    private boolean isDefault;
}
