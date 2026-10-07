package com.styleme.returns.dto;

import java.math.BigDecimal;

public record ReturnDecisionRequest(
        String notes,
        BigDecimal refundAmount
) {}
