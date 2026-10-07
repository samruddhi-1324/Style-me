package com.styleme.payment.provider;

import com.styleme.order.entity.Order;
import com.styleme.payment.entity.Payment;

public interface PaymentProvider {
    /**
     * Identifies the provider (e.g., 'MOCK', 'STRIPE').
     */
    String getProviderName();

    /**
     * Initiate payment transaction on the provider side.
     */
    PaymentInitiationResult initiatePayment(Order order, Payment payment);

    /**
     * Verifies payment status with the provider.
     */
    PaymentVerificationResult verifyPayment(Payment payment, String providerTransactionId, String providerStatus);

    record PaymentInitiationResult(boolean success, String providerTransactionId, String redirectUrl, String errorMessage) {}
    
    record PaymentVerificationResult(boolean success, boolean isPending, String errorMessage) {}
}
