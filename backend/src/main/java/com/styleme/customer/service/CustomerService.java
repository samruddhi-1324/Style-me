package com.styleme.customer.service;

import com.styleme.common.exception.ResourceNotFoundException;
import com.styleme.customer.dto.AddressRequest;
import com.styleme.customer.dto.AddressResponse;
import com.styleme.customer.dto.CustomerProfileRequest;
import com.styleme.customer.dto.CustomerResponse;
import com.styleme.customer.entity.Address;
import com.styleme.customer.entity.Customer;
import com.styleme.customer.repository.AddressRepository;
import com.styleme.customer.repository.CustomerRepository;
import com.styleme.user.entity.User;
import com.styleme.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;

    @Transactional
    public Customer getOrCreateCustomer(UUID userId) {
        return customerRepository.findById(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            Customer newCustomer = new Customer(user);
            return customerRepository.save(newCustomer);
        });
    }

    @Transactional
    public CustomerResponse getProfile(UUID customerId) {
        Customer customer = getOrCreateCustomer(customerId);
        return toCustomerResponse(customer);
    }

    @Transactional
    public CustomerResponse updateProfile(UUID customerId, CustomerProfileRequest req) {
        Customer customer = getOrCreateCustomer(customerId);
        User user = customer.getUser();

        if (req.getFirstName() != null) user.setFirstName(req.getFirstName());
        if (req.getLastName() != null) user.setLastName(req.getLastName());
        if (req.getPhoneNumber() != null) user.setPhoneNumber(req.getPhoneNumber());
        if (req.getMarketingOptIn() != null) customer.setMarketingOptIn(req.getMarketingOptIn());

        userRepository.save(user);
        customer = customerRepository.save(customer);

        return toCustomerResponse(customer);
    }

    @Transactional(readOnly = true)
    public List<AddressResponse> getAddresses(UUID customerId) {
        return addressRepository.findByCustomerId(customerId)
                .stream().map(this::toAddressResponse).collect(Collectors.toList());
    }

    @Transactional
    public AddressResponse addAddress(UUID customerId, AddressRequest req) {
        Customer customer = getOrCreateCustomer(customerId);

        if (req.isDefault()) {
            addressRepository.findByCustomerIdAndIsDefaultTrue(customerId).ifPresent(addr -> {
                addr.setDefault(false);
                addressRepository.save(addr);
            });
        }

        Address address = new Address();
        address.setCustomer(customer);
        mapAddressFields(req, address);
        
        // If it's their first address, make it default automatically
        if (addressRepository.findByCustomerId(customerId).isEmpty()) {
            address.setDefault(true);
        }

        address = addressRepository.save(address);
        return toAddressResponse(address);
    }

    @Transactional
    public AddressResponse updateAddress(UUID customerId, Long addressId, AddressRequest req) {
        Address address = getAddressByCustomerAndId(customerId, addressId);

        if (req.isDefault() && !address.isDefault()) {
            addressRepository.findByCustomerIdAndIsDefaultTrue(customerId).ifPresent(addr -> {
                addr.setDefault(false);
                addressRepository.save(addr);
            });
        }

        mapAddressFields(req, address);
        address = addressRepository.save(address);
        return toAddressResponse(address);
    }

    @Transactional
    public void deleteAddress(UUID customerId, Long addressId) {
        Address address = getAddressByCustomerAndId(customerId, addressId);
        addressRepository.delete(address);
    }

    private Address getAddressByCustomerAndId(UUID customerId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        
        if (!address.getCustomer().getId().equals(customerId)) {
            throw new ResourceNotFoundException("Address not found for this customer");
        }
        return address;
    }

    private void mapAddressFields(AddressRequest req, Address address) {
        address.setAddressType(req.getAddressType());
        address.setFirstName(req.getFirstName());
        address.setLastName(req.getLastName());
        address.setPhoneNumber(req.getPhoneNumber());
        address.setLine1(req.getLine1());
        address.setLine2(req.getLine2());
        address.setCity(req.getCity());
        address.setState(req.getState());
        address.setPostalCode(req.getPostalCode());
        address.setCountry(req.getCountry());
        if (req.isDefault()) {
            address.setDefault(true);
        }
    }

    private CustomerResponse toCustomerResponse(Customer customer) {
        return CustomerResponse.builder()
                .id(customer.getId())
                .email(customer.getUser().getEmail())
                .firstName(customer.getUser().getFirstName())
                .lastName(customer.getUser().getLastName())
                .phoneNumber(customer.getUser().getPhoneNumber())
                .marketingOptIn(customer.isMarketingOptIn())
                .build();
    }

    private AddressResponse toAddressResponse(Address address) {
        return AddressResponse.builder()
                .id(address.getId())
                .addressType(address.getAddressType())
                .firstName(address.getFirstName())
                .lastName(address.getLastName())
                .phoneNumber(address.getPhoneNumber())
                .line1(address.getLine1())
                .line2(address.getLine2())
                .city(address.getCity())
                .state(address.getState())
                .postalCode(address.getPostalCode())
                .country(address.getCountry())
                .isDefault(address.isDefault())
                .build();
    }
}
