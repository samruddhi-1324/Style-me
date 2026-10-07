package com.styleme.cart.entity;

import com.styleme.product.entity.Product;
import com.styleme.product.entity.ProductVariant;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "cart_items")
@Getter
@Setter
@NoArgsConstructor
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id")
    private ProductVariant variant;

    @Column(nullable = false)
    private int quantity = 1;

    @Column(name = "added_at", nullable = false, updatable = false)
    private Instant addedAt = Instant.now();

    public CartItem(Cart cart, Product product, ProductVariant variant, int quantity) {
        this.cart = cart;
        this.product = product;
        this.variant = variant;
        this.quantity = quantity;
    }
}
