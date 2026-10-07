package com.styleme.wishlist.repository;

import com.styleme.wishlist.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface WishlistRepository extends JpaRepository<Wishlist, UUID> {
    Optional<Wishlist> findByCustomerId(UUID customerId);
}
