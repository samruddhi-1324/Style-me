package com.styleme.returns.entity;

import com.styleme.customer.entity.Customer;
import com.styleme.order.entity.Order;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "refunds")
@Getter
@Setter
@NoArgsConstructor
public class Refund {

    @Id
    @Column(length = 36)
    private String id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "return_request_id", nullable = false, unique = true)
    private ReturnRequest returnRequest;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private RefundStatus status = RefundStatus.PENDING;

    @Column(name = "payment_provider", nullable = false, length = 100)
    private String paymentProvider = "MOCK";

    @Column(name = "payment_reference", length = 255)
    private String paymentReference;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "initiated_at", nullable = false, updatable = false)
    private Instant initiatedAt = Instant.now();

    @Column(name = "processed_at")
    private Instant processedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
        if (this.initiatedAt == null) {
            this.initiatedAt = Instant.now();
        }
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
    }
}
