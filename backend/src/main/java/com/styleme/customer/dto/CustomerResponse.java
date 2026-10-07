package com.styleme.customer.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class CustomerResponse {
    private UUID id;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private boolean marketingOptIn;
}
