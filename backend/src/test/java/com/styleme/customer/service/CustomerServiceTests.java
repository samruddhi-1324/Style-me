package com.styleme.customer.service;

import com.styleme.customer.dto.AddressRequest;
import com.styleme.customer.dto.AddressResponse;
import com.styleme.customer.entity.Address;
import com.styleme.customer.entity.AddressType;
import com.styleme.customer.entity.Customer;
import com.styleme.customer.repository.AddressRepository;
import com.styleme.customer.repository.CustomerRepository;
import com.styleme.user.entity.User;
import com.styleme.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class CustomerServiceTests {

    private CustomerRepository customerRepository;
    private UserRepository userRepository;
    private AddressRepository addressRepository;
    private CustomerService customerService;

    @BeforeEach
    void setUp() {
        customerRepository = Mockito.mock(CustomerRepository.class);
        userRepository = Mockito.mock(UserRepository.class);
        addressRepository = Mockito.mock(AddressRepository.class);
        customerService = new CustomerService(customerRepository, userRepository, addressRepository);
    }

    @Test
    @DisplayName("addAddress: sets default if it's the first address")
    void testAddFirstAddress() {
        UUID customerId = UUID.randomUUID();
        User user = new User();
        Customer customer = new Customer(user);
        customer.setId(customerId);

        when(customerRepository.findById(customerId)).thenReturn(Optional.of(customer));
        when(addressRepository.findByCustomerId(customerId)).thenReturn(List.of());
        when(addressRepository.save(any(Address.class))).thenAnswer(i -> {
            Address a = i.getArgument(0);
            a.setId(1L);
            return a;
        });

        AddressRequest req = new AddressRequest();
        req.setAddressType(AddressType.SHIPPING);
        req.setLine1("123 Main St");
        req.setCity("NY");
        req.setState("NY");
        req.setPostalCode("10001");
        req.setCountry("USA");
        req.setFirstName("John");
        req.setLastName("Doe");

        AddressResponse res = customerService.addAddress(customerId, req);

        assertTrue(res.isDefault());
        assertEquals("123 Main St", res.getLine1());
    }
}
