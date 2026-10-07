package com.styleme.payment.entity;

/**
 * SRS Section 104 Payment Domain Separation states.
 */
public enum PaymentStatus {
    INITIATED,
    PENDING,
    SUCCESS,
    FAILED,
    CANCELLED,
    REFUNDED,
    PARTIALLY_REFUNDED
}
