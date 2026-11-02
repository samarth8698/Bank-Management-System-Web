package com.bank.banking.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.bank.banking.entity.Customer;
import com.bank.banking.entity.Transaction;
import com.bank.banking.service.TransactionService;
import com.bank.banking.service.TransactionFailureService;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "http://localhost:5173")
public class TransactionController {

    private final TransactionService transactionService;
    private final TransactionFailureService failureService;

    public TransactionController(
            TransactionService transactionService,
            TransactionFailureService failureService) {

        this.transactionService = transactionService;
        this.failureService = failureService;
    }

    // Deposit Money
    @PostMapping("/deposit/{accountId}")
    public ResponseEntity<?> deposit(
            @PathVariable Long accountId,
            @RequestParam BigDecimal amount,
            @AuthenticationPrincipal Customer customer) {

        try {
            return ResponseEntity.ok(
                    transactionService.deposit(
                            accountId, customer.getId(), amount));

        } catch (RuntimeException ex) {

            logFailure(customer, accountId, "DEPOSIT", amount, ex);

            return failedResponse(ex);
        }
    }

    // Withdraw Money
    @PostMapping("/withdraw/{accountId}")
    public ResponseEntity<?> withdraw(
            @PathVariable Long accountId,
            @RequestParam BigDecimal amount,
            @AuthenticationPrincipal Customer customer) {

        try {
            return ResponseEntity.ok(
                    transactionService.withdraw(
                            accountId, customer.getId(), amount));

        } catch (RuntimeException ex) {

            logFailure(customer, accountId, "WITHDRAWAL", amount, ex);

            return failedResponse(ex);
        }
    }

    // Fund Transfer
    @PostMapping("/transfer/{senderAccountId}")
    public ResponseEntity<?> transfer(
            @PathVariable Long senderAccountId,
            @AuthenticationPrincipal Customer customer,
            @RequestBody Map<String, String> request) {

        BigDecimal amount = null;

        try {
            String amountValue = request.get("amount");

            if (amountValue != null) {
                amount = new BigDecimal(amountValue);
            }

            String message = transactionService.transfer(
                    senderAccountId,
                    customer.getId(),
                    request.get("receiverAccountNumber"),
                    amount,
                    request.get("pin"));

            return ResponseEntity.ok(
                    Map.of(
                            "status", "SUCCESS",
                            "message", message));

        } catch (RuntimeException ex) {

            logFailure(
                    customer,
                    senderAccountId,
                    "FUND_TRANSFER",
                    amount,
                    ex);

            return failedResponse(ex);
        }
    }

    // Get Transaction History
    @GetMapping("/history/{accountId}")
    public ResponseEntity<List<Transaction>> getTransactionHistory(
            @PathVariable Long accountId,
            @AuthenticationPrincipal Customer customer) {

        return ResponseEntity.ok(
                transactionService.getTransactionHistory(
                        accountId, customer.getId()));
    }

    // Balance Enquiry
    @GetMapping("/balance/{accountId}")
    public ResponseEntity<BigDecimal> getBalance(
            @PathVariable Long accountId,
            @AuthenticationPrincipal Customer customer) {

        return ResponseEntity.ok(
                transactionService.getBalance(
                        accountId, customer.getId()));
    }

    // Save Failed Transaction
    private void logFailure(
            Customer customer,
            Long accountId,
            String operation,
            BigDecimal amount,
            RuntimeException ex) {

        try {
            Long customerId =
                    customer != null ? customer.getId() : null;

            failureService.logFailure(
                    customerId,
                    accountId,
                    operation,
                    amount,
                    ex.getMessage());

        } catch (Exception loggingException) {
            // Original transaction error will be returned.
        }
    }

    // Failed Response
    private ResponseEntity<Map<String, String>> failedResponse(
            RuntimeException ex) {

        String message = ex.getMessage() == null
                ? "Transaction failed"
                : ex.getMessage();

        return ResponseEntity.badRequest().body(
                Map.of(
                        "status", "FAILED",
                        "message", message));
    }
}