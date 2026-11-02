package com.bank.banking.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.bank.banking.entity.TransactionFailure;
import com.bank.banking.repository.TransactionFailureRepository;

@Service
public class TransactionFailureService {

    private final TransactionFailureRepository failureRepository;

    public TransactionFailureService(
            TransactionFailureRepository failureRepository) {
        this.failureRepository = failureRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logFailure(
            Long customerId,
            Long accountId,
            String operation,
            BigDecimal amount,
            String reason) {

        TransactionFailure failure = new TransactionFailure();

        failure.setCustomerId(customerId);
        failure.setAccountId(accountId);
        failure.setOperation(operation);
        failure.setAmount(amount);
        failure.setStatus("FAILED");
        failure.setReason(safeReason(reason));
        failure.setOccurredAt(LocalDateTime.now());

        failureRepository.save(failure);
    }

    private String safeReason(String reason) {

        if (reason == null || reason.isBlank()) {
            return "Transaction failed";
        }

        String cleaned = reason
                .replaceAll("[\\r\\n\\t]", " ")
                .trim();

        return cleaned.length() > 500
                ? cleaned.substring(0, 500)
                : cleaned;
    }
}