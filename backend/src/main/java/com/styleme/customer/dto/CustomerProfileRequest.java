package com.styleme.customer.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomerProfileRequest {
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private Boolean marketingOptIn;
}
