package com.styleme.customer.entity;

import com.fasterxml.jackson.databind.JsonNode;
import com.styleme.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Customer profile extending the base User entity.
 */
@Entity
@Table(name = "customers")
@Getter
@Setter
@NoArgsConstructor
public class Customer {

    @Id
    @Column(name = "user_id")
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "marketing_opt_in", nullable = false)
    private boolean marketingOptIn = false;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "preferences_json", columnDefinition = "jsonb")
    private JsonNode preferencesJson;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Address> addresses = new ArrayList<>();

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public Customer(User user) {
        this.user = user;
    }
}
