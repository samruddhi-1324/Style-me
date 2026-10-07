package com.styleme.cms.repository;

import com.styleme.cms.entity.CmsPage;
import com.styleme.cms.entity.CmsPageStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CmsPageRepository extends JpaRepository<CmsPage, Long> {

    Optional<CmsPage> findBySlug(String slug);

    boolean existsBySlug(String slug);

    List<CmsPage> findByStatusOrderByUpdatedAtDesc(CmsPageStatus status);

    List<CmsPage> findByStatus(CmsPageStatus status);
}
