package com.styleme.order.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * Immutable record of every order state transition.
 * SRS Section 103: Backend controls all state changes; every change is audited.
 */
@Entity
@Table(name = "order_status_history")
@Getter
@Setter
@NoArgsConstructor
public class OrderStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false, length = 36)
    private String orderId;

    @Column(name = "from_status", length = 30)
    private String fromStatus;

    @Column(name = "to_status", nullable = false, length = 30)
    private String toStatus;

    @Column(name = "changed_by", length = 100)
    private String changedBy;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "changed_at", nullable = false, updatable = false)
    private Instant changedAt = Instant.now();

    public OrderStatusHistory(String orderId, String fromStatus, String toStatus, String changedBy) {
        this.orderId = orderId;
        this.fromStatus = fromStatus;
        this.toStatus = toStatus;
        this.changedBy = changedBy;
    }
}
