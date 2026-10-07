package com.styleme.returns.repository;

import com.styleme.returns.entity.Refund;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefundRepository extends JpaRepository<Refund, String> {

    Optional<Refund> findByReturnRequestId(String returnRequestId);
}
