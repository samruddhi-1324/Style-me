package com.styleme.cart.entity;

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
@Table(name = "carts")
@Getter
@Setter
@NoArgsConstructor
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // A cart belongs to either a logged-in customer...
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", unique = true)
    private Customer customer;

    // ...or a guest session
    @Column(name = "session_id", length = 255)
    private String sessionId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<CartItem> items = new ArrayList<>();

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
