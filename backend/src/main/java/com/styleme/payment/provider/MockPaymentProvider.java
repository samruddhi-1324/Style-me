package com.styleme.payment.provider;

import com.styleme.order.entity.Order;
import com.styleme.payment.entity.Payment;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Mock implementation of a Payment Provider for local testing.
 * Simulates an external payment gateway.
 */
@Component
public class MockPaymentProvider implements PaymentProvider {

    public static final String PROVIDER_NAME = "MOCK";

    @Override
    public String getProviderName() {
        return PROVIDER_NAME;
    }

    @Override
    public PaymentInitiationResult initiatePayment(Order order, Payment payment) {
        // Simulate a successful initialization returning a mock transaction ID
        String mockTxId = "mock_tx_" + UUID.randomUUID().toString().substring(0, 8);
        return new PaymentInitiationResult(
                true,
                mockTxId,
                "https://mock-gateway.example.com/pay/" + mockTxId,
                null
        );
    }

    @Override
    public PaymentVerificationResult verifyPayment(Payment payment, String providerTransactionId, String providerStatus) {
        if ("SUCCESS".equalsIgnoreCase(providerStatus)) {
            return new PaymentVerificationResult(true, false, null);
        } else if ("FAILED".equalsIgnoreCase(providerStatus)) {
            return new PaymentVerificationResult(false, false, "Mock payment rejected by user");
        } else {
            // Treat as pending
            return new PaymentVerificationResult(false, true, null);
        }
    }
}
