package com.styleme.wishlist.entity;

import com.styleme.customer.entity.Customer;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "wishlists")
@Getter
@Setter
@NoArgsConstructor
public class Wishlist {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", unique = true, nullable = false)
    private Customer customer;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @OneToMany(mappedBy = "wishlist", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<WishlistItem> items = new ArrayList<>();

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
