package com.styleme.returns.service;

import com.styleme.common.exception.BadRequestException;
import com.styleme.common.exception.ConflictException;
import com.styleme.common.exception.ResourceNotFoundException;
import com.styleme.customer.entity.Customer;
import com.styleme.customer.repository.CustomerRepository;
import com.styleme.order.entity.Order;
import com.styleme.order.entity.OrderItem;
import com.styleme.order.entity.OrderStatus;
import com.styleme.order.repository.OrderRepository;
import com.styleme.order.service.OrderService;
import com.styleme.returns.dto.*;
import com.styleme.returns.entity.Refund;
import com.styleme.returns.entity.RefundStatus;
import com.styleme.returns.entity.ReturnItem;
import com.styleme.returns.entity.ReturnRequest;
import com.styleme.returns.entity.ReturnStatus;
import com.styleme.returns.repository.RefundRepository;
import com.styleme.returns.repository.ReturnRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReturnService {

    private final ReturnRequestRepository returnRequestRepository;
    private final RefundRepository refundRepository;
    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final OrderService orderService;

    @Transactional
    public ReturnRequestResponse createReturn(UUID customerId, CreateReturnRequest request) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        Order order = orderRepository.findByIdAndCustomerId(request.orderId(), customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found or unauthorized"));

        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new BadRequestException("Returns are only allowed for delivered orders");
        }

        if (returnRequestRepository.existsByOrderIdAndStatusIn(
                order.getId(),
                List.of(ReturnStatus.PENDING, ReturnStatus.APPROVED, ReturnStatus.RECEIVED, ReturnStatus.COMPLETED)
        )) {
            throw new ConflictException("A return request already exists for this order");
        }

        if (request.items() == null || request.items().isEmpty()) {
            throw new BadRequestException("At least one item must be selected for return");
        }

        Map<Long, Integer> requestedByOrderItemId = request.items().stream()
                .collect(Collectors.toMap(ReturnItemRequest::orderItemId, ReturnItemRequest::quantity, Integer::sum));

        ReturnRequest returnRequest = new ReturnRequest();
        returnRequest.setOrder(order);
        returnRequest.setCustomer(customer);
        returnRequest.setReason(request.reason());
        returnRequest.setNotes(request.notes());
        returnRequest.setStatus(ReturnStatus.PENDING);
        returnRequest.setRefundStatus(RefundStatus.PENDING);

        BigDecimal calculatedRefund = BigDecimal.ZERO;

        for (Map.Entry<Long, Integer> entry : requestedByOrderItemId.entrySet()) {
            Long orderItemId = entry.getKey();
            Integer requestedQuantity = entry.getValue();

            OrderItem orderItem = order.getItems().stream()
                    .filter(item -> item.getId().equals(orderItemId))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Order item not found in this order"));

            if (requestedQuantity > orderItem.getQuantity()) {
                throw new BadRequestException("Requested quantity exceeds the ordered quantity for item " + orderItemId);
            }

            ReturnItem returnItem = new ReturnItem();
            returnItem.setReturnRequest(returnRequest);
            returnItem.setOrderItemId(orderItem.getId());
            returnItem.setProductId(orderItem.getProductId());
            returnItem.setProductName(orderItem.getProductName());
            returnItem.setVariantId(orderItem.getVariantId());
            returnItem.setVariantName(orderItem.getVariantName());
            returnItem.setSku(orderItem.getSku());
            returnItem.setQuantity(requestedQuantity);
            returnItem.setUnitPrice(orderItem.getUnitPrice());
            BigDecimal lineTotal = orderItem.getUnitPrice().multiply(BigDecimal.valueOf(requestedQuantity));
            returnItem.setLineTotal(lineTotal);

            returnRequest.getItems().add(returnItem);
            calculatedRefund = calculatedRefund.add(lineTotal);
        }

        returnRequest.setRefundAmount(calculatedRefund);
        returnRequest = returnRequestRepository.save(returnRequest);

        orderService.updateOrderStatus(order.getId(), OrderStatus.RETURN_REQUESTED, "CUSTOMER",
                "Return request created: " + returnRequest.getId());

        return toResponse(returnRequest);
    }

    @Transactional(readOnly = true)
    public ReturnRequestResponse getReturn(String id, UUID customerId) {
        ReturnRequest returnRequest = returnRequestRepository.findByIdAndCustomerId(id, customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Return request not found or unauthorized"));
        return toResponse(returnRequest);
    }

    @Transactional(readOnly = true)
    public Page<ReturnRequestResponse> getCustomerReturns(UUID customerId, Pageable pageable) {
        return returnRequestRepository.findByCustomerIdOrderByRequestedAtDesc(customerId, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<ReturnRequestResponse> getAllReturns(Pageable pageable) {
        return returnRequestRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional
    public ReturnRequestResponse approveReturn(String returnId, ReturnDecisionRequest decision) {
        ReturnRequest returnRequest = returnRequestRepository.findById(returnId)
                .orElseThrow(() -> new ResourceNotFoundException("Return request not found"));

        if (returnRequest.getStatus() != ReturnStatus.PENDING) {
            throw new BadRequestException("Only pending return requests can be approved");
        }

        BigDecimal approvedAmount = decision.refundAmount() != null
                ? decision.refundAmount()
                : returnRequest.getRefundAmount();

        if (approvedAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Approved refund amount must be greater than zero");
        }
        if (approvedAmount.compareTo(returnRequest.getRefundAmount()) > 0) {
            throw new BadRequestException("Approved refund amount cannot exceed the calculated return value");
        }

        returnRequest.setRefundAmount(approvedAmount);
        returnRequest.setStatus(ReturnStatus.APPROVED);
        returnRequest.setRefundStatus(RefundStatus.PROCESSING);
        returnRequest.setReviewedAt(Instant.now());
        if (decision.notes() != null && !decision.notes().isBlank()) {
            returnRequest.setNotes(decision.notes());
        }

        returnRequestRepository.save(returnRequest);

        orderService.updateOrderStatus(returnRequest.getOrder().getId(), OrderStatus.RETURN_REQUESTED,
                "ADMIN", "Return request approved");

        return toResponse(returnRequest);
    }

    @Transactional
    public ReturnRequestResponse rejectReturn(String returnId, ReturnDecisionRequest decision) {
        ReturnRequest returnRequest = returnRequestRepository.findById(returnId)
                .orElseThrow(() -> new ResourceNotFoundException("Return request not found"));

        if (returnRequest.getStatus() != ReturnStatus.PENDING) {
            throw new BadRequestException("Only pending return requests can be rejected");
        }

        returnRequest.setStatus(ReturnStatus.REJECTED);
        returnRequest.setRefundStatus(RefundStatus.CANCELLED);
        returnRequest.setReviewedAt(Instant.now());
        if (decision != null && decision.notes() != null && !decision.notes().isBlank()) {
            returnRequest.setNotes(decision.notes());
        }

        returnRequestRepository.save(returnRequest);

        if (returnRequest.getOrder().getStatus() == OrderStatus.RETURN_REQUESTED) {
            orderService.updateOrderStatus(returnRequest.getOrder().getId(), OrderStatus.DELIVERED,
                    "ADMIN", "Return request rejected");
        }

        return toResponse(returnRequest);
    }

    @Transactional
    public ReturnRequestResponse completeReturn(String returnId, ReturnDecisionRequest decision) {
        ReturnRequest returnRequest = returnRequestRepository.findById(returnId)
                .orElseThrow(() -> new ResourceNotFoundException("Return request not found"));

        if (returnRequest.getStatus() != ReturnStatus.APPROVED) {
            throw new BadRequestException("Only approved return requests can be completed");
        }

        if (refundRepository.findByReturnRequestId(returnRequest.getId()).isPresent()) {
            return toResponse(returnRequest);
        }

        returnRequest.setStatus(ReturnStatus.COMPLETED);
        returnRequest.setRefundStatus(RefundStatus.COMPLETED);
        returnRequest.setCompletedAt(Instant.now());
        if (decision != null && decision.notes() != null && !decision.notes().isBlank()) {
            returnRequest.setNotes(decision.notes());
        }

        Refund refund = new Refund();
        refund.setReturnRequest(returnRequest);
        refund.setOrder(returnRequest.getOrder());
        refund.setCustomer(returnRequest.getCustomer());
        refund.setAmount(returnRequest.getRefundAmount());
        refund.setStatus(RefundStatus.COMPLETED);
        refund.setPaymentProvider("MOCK");
        refund.setPaymentReference("RF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        refund.setNotes(decision != null ? decision.notes() : "Refund processed");
        refundRepository.save(refund);

        orderService.updateOrderStatus(returnRequest.getOrder().getId(), OrderStatus.REFUNDED,
                "ADMIN", "Refund completed for return " + returnRequest.getId());

        returnRequestRepository.save(returnRequest);
        return toResponse(returnRequest);
    }

    private ReturnRequestResponse toResponse(ReturnRequest request) {
        return new ReturnRequestResponse(
                request.getId(),
                request.getOrder().getId(),
                request.getOrder().getOrderNumber(),
                request.getCustomer().getId(),
                request.getStatus(),
                request.getReason(),
                request.getNotes(),
                request.getRefundAmount(),
                request.getRefundStatus(),
                request.getRequestedAt(),
                request.getReviewedAt(),
                request.getCompletedAt(),
                request.getItems().stream().map(this::toItemResponse).collect(Collectors.toList())
        );
    }

    private ReturnItemResponse toItemResponse(ReturnItem item) {
        return new ReturnItemResponse(
                item.getId(),
                item.getOrderItemId(),
                item.getProductId(),
                item.getProductName(),
                item.getVariantName(),
                item.getSku(),
                item.getQuantity(),
                item.getUnitPrice(),
                item.getLineTotal()
        );
    }
}
