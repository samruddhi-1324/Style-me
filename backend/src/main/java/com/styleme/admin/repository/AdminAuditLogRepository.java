package com.styleme.admin.repository;

import com.styleme.admin.entity.AdminAuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminAuditLogRepository extends JpaRepository<AdminAuditLog, Long> {

    Page<AdminAuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
