package com.styleme.wishlist.entity;

import com.styleme.product.entity.Product;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "wishlist_items")
@Getter
@Setter
@NoArgsConstructor
public class WishlistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "wishlist_id", nullable = false)
    private Wishlist wishlist;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "added_at", nullable = false, updatable = false)
    private Instant addedAt = Instant.now();

    public WishlistItem(Wishlist wishlist, Product product) {
        this.wishlist = wishlist;
        this.product = product;
    }
}
