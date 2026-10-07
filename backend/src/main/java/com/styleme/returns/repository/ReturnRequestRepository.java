package com.styleme.returns.repository;

import com.styleme.returns.entity.ReturnRequest;
import com.styleme.returns.entity.ReturnStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.Optional;
import java.util.UUID;

public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, String> {

    Optional<ReturnRequest> findByIdAndCustomerId(String id, UUID customerId);

    Page<ReturnRequest> findByCustomerIdOrderByRequestedAtDesc(UUID customerId, Pageable pageable);

    boolean existsByOrderIdAndStatusIn(String orderId, Collection<ReturnStatus> statuses);
}
