package com.styleme.product.repository;

import com.styleme.product.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, UUID> {

    List<ProductVariant> findByProductId(String productId);

    Optional<ProductVariant> findBySku(String sku);

    boolean existsBySku(String sku);
}
