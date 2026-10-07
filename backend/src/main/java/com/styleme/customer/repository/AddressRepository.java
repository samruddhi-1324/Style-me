package com.styleme.customer.repository;

import com.styleme.customer.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findByCustomerId(UUID customerId);
    Optional<Address> findByCustomerIdAndIsDefaultTrue(UUID customerId);
}
