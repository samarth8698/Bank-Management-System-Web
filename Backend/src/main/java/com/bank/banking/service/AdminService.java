package com.bank.banking.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bank.banking.entity.Customer;
import com.bank.banking.entity.Account;
import com.bank.banking.entity.Transaction;

import com.bank.banking.repository.CustomerRepository;
import com.bank.banking.repository.AccountRepository;
import com.bank.banking.repository.TransactionRepository;

@Service
@Transactional(readOnly = true)
public class AdminService {

    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    public AdminService(
            CustomerRepository customerRepository,
            AccountRepository accountRepository,
            TransactionRepository transactionRepository) {

        this.customerRepository = customerRepository;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    // Dashboard Statistics
    public Map<String, Object> getDashboardStatistics() {

        long totalCustomers = customerRepository.countByRole("CUSTOMER");

        long totalAccounts = accountRepository.count();

        long totalTransactions = transactionRepository.count();

        BigDecimal totalBalance = accountRepository.getTotalBalance();

        BigDecimal totalDeposits =
                transactionRepository.getTotalByTransactionType("DEPOSIT");

        BigDecimal totalWithdrawals =
                transactionRepository.getTotalByTransactionType("WITHDRAWAL");

        return Map.of(
                "totalCustomers", totalCustomers,
                "totalAccounts", totalAccounts,
                "totalTransactions", totalTransactions,
                "totalBalance", totalBalance,
                "totalDeposits", totalDeposits,
                "totalWithdrawals", totalWithdrawals
        );
    }

    // Get All Customers
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll()
                .stream()
                .filter(customer -> "CUSTOMER".equalsIgnoreCase(customer.getRole()))
                .toList();
    }

    // Get All Accounts
    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    // Get All Transactions
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAllByOrderByTransactionDateDesc();
    }
}