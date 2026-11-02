package com.bank.banking.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.bank.banking.entity.Customer;
import com.bank.banking.entity.Account;
import com.bank.banking.entity.Transaction;
import com.bank.banking.entity.TransactionFailure;

import com.bank.banking.service.AdminService;
import com.bank.banking.repository.TransactionFailureRepository;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    private final AdminService adminService;
    private final TransactionFailureRepository failureRepository;

    public AdminController(
            AdminService adminService,
            TransactionFailureRepository failureRepository) {

        this.adminService = adminService;
        this.failureRepository = failureRepository;
    }

    // Dashboard Statistics
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {

        return ResponseEntity.ok(
                adminService.getDashboardStatistics()
        );
    }

    // Get All Customers
    @GetMapping("/customers")
    public ResponseEntity<List<Customer>> getAllCustomers() {

        return ResponseEntity.ok(
                adminService.getAllCustomers()
        );
    }

    // Get All Accounts
    @GetMapping("/accounts")
    public ResponseEntity<List<Account>> getAllAccounts() {

        return ResponseEntity.ok(
                adminService.getAllAccounts()
        );
    }

    // Get All Transactions
    @GetMapping("/transactions")
    public ResponseEntity<List<Transaction>> getAllTransactions() {

        return ResponseEntity.ok(
                adminService.getAllTransactions()
        );
    }

    // Get All Failed Transactions
    @GetMapping("/failed-transactions")
    public ResponseEntity<List<TransactionFailure>> getAllFailedTransactions() {

        return ResponseEntity.ok(
                failureRepository.findAllByOrderByOccurredAtDesc()
        );
    }

    // Count Failed Transactions
    @GetMapping("/failed-transactions/count")
    public ResponseEntity<Long> getFailedTransactionCount() {

        return ResponseEntity.ok(
                failureRepository.countByStatus("FAILED")
        );
    }
}