package com.bank.banking.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import com.bank.banking.entity.Account;
import com.bank.banking.entity.Customer;
import com.bank.banking.repository.AccountRepository;
import com.bank.banking.repository.CustomerRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class AccountService {

    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public AccountService(
            AccountRepository accountRepository,
            CustomerRepository customerRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService) {

        this.accountRepository = accountRepository;
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    // Generate Unique Account Number
    private String generateAccountNumber() {

        String accountNumber;

        do {
            accountNumber = "SB"
                    + System.currentTimeMillis()
                    + UUID.randomUUID()
                            .toString()
                            .substring(0, 4)
                            .toUpperCase();

        } while (accountRepository
                .findByAccountNumber(accountNumber)
                .isPresent());

        return accountNumber;
    }

    // Create Account
    public Account createAccount(Long customerId, Account account) {

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() ->
                        new RuntimeException("Customer not found!"));

        account.setAccountNumber(generateAccountNumber());
        account.setCustomer(customer);
        account.setBalance(BigDecimal.ZERO);
        account.setOpeningDate(LocalDate.now());
        account.setStatus("ACTIVE");

        return accountRepository.save(account);
    }

    // Create Account For Logged-in Customer
    public Account createMyAccount(Customer customer, Account account) {

        account.setAccountNumber(generateAccountNumber());
        account.setCustomer(customer);
        account.setBalance(BigDecimal.ZERO);
        account.setOpeningDate(LocalDate.now());
        account.setStatus("ACTIVE");

        return accountRepository.save(account);
    }

    // Get All Accounts
    @Transactional(readOnly = true)
    public List<Account> getAllAccounts() {

        return accountRepository.findAll();
    }

    // Get Account By ID
    @Transactional(readOnly = true)
    public Account getAccountById(Long id) {

        return accountRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Account not found!"));
    }

    // Get Account By Account Number
    @Transactional(readOnly = true)
    public Account getAccountByNumber(String accountNumber) {

        return accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() ->
                        new RuntimeException("Account not found!"));
    }

    // Get Accounts By Customer ID
    @Transactional(readOnly = true)
    public List<Account> getAccountsByCustomerId(Long customerId) {

        return accountRepository.findByCustomer_Id(customerId);
    }

    // Freeze / Unfreeze Account
    public Account updateAccountStatus(Long id, String status) {

        if (status == null || status.isBlank()) {
            throw new RuntimeException("Account status is required!");
        }

        String normalizedStatus = status.trim().toUpperCase();

        if (!normalizedStatus.equals("ACTIVE")
                && !normalizedStatus.equals("FROZEN")) {

            throw new RuntimeException(
                    "Invalid status! Only ACTIVE or FROZEN is allowed.");
        }

        Account account = getAccountById(id);

        String previousStatus = account.getStatus();

        account.setStatus(normalizedStatus);

        Account updatedAccount = accountRepository.save(account);

        // Send Email Only When Status Changes
        if (!normalizedStatus.equalsIgnoreCase(previousStatus)) {

            Customer customer = account.getCustomer();

            if (customer != null && customer.getEmail() != null) {

                String email = customer.getEmail();

                String name = customer.getFirstName()
                        + " " + customer.getLastName();

                sendStatusEmailAfterCommit(
                        email,
                        name,
                        normalizedStatus
                );
            }
        }

        return updatedAccount;
    }

    // Send Account Status Email After Database Commit
    private void sendStatusEmailAfterCommit(
            String email,
            String name,
            String status) {

        Runnable emailTask = () -> {

            try {

                emailService.sendAccountStatusEmail(
                        email,
                        name,
                        status
                );

            } catch (Exception ex) {

                System.err.println(
                        "Account Status Email Failed: " + ex.getMessage()
                );
            }
        };

        if (TransactionSynchronizationManager.isSynchronizationActive()) {

            TransactionSynchronizationManager.registerSynchronization(
                    new TransactionSynchronization() {

                        @Override
                        public void afterCommit() {
                            emailTask.run();
                        }
                    }
            );

        } else {

            emailTask.run();
        }
    }

    // Set First PIN
    public void setPin(
            Long accountId,
            Long customerId,
            String newPin,
            String confirmPin) {

        if (newPin == null || !newPin.matches("\\d{6}")) {
            throw new RuntimeException(
                    "PIN must contain exactly 6 digits!");
        }

        if (confirmPin == null || !confirmPin.matches("\\d{6}")) {
            throw new RuntimeException(
                    "Confirm PIN must contain exactly 6 digits!");
        }

        if (!newPin.equals(confirmPin)) {
            throw new RuntimeException(
                    "PIN and Confirm PIN do not match!");
        }

        Account account = getAccountById(accountId);

        if (account.getCustomer() == null ||
                !account.getCustomer().getId().equals(customerId)) {

            throw new RuntimeException("Unauthorized account access!");
        }

        if (!"ACTIVE".equalsIgnoreCase(account.getStatus())) {
            throw new RuntimeException("Account is not active!");
        }

        if (account.getPin() != null) {
            throw new RuntimeException(
                    "PIN is already set! Use Change PIN.");
        }

        account.setPin(passwordEncoder.encode(newPin));

        accountRepository.save(account);
    }

    // Change Account PIN
    public void changePin(
            Long accountId,
            Long customerId,
            String currentPin,
            String newPin,
            String confirmPin) {

        if (currentPin == null || !currentPin.matches("\\d{6}")) {
            throw new RuntimeException(
                    "Current PIN must be 6 digits!");
        }

        if (newPin == null || !newPin.matches("\\d{6}")) {
            throw new RuntimeException(
                    "New PIN must be 6 digits!");
        }

        if (confirmPin == null || !confirmPin.matches("\\d{6}")) {
            throw new RuntimeException(
                    "Confirm PIN must be 6 digits!");
        }

        if (!newPin.equals(confirmPin)) {
            throw new RuntimeException(
                    "New PIN and Confirm PIN do not match!");
        }

        if (currentPin.equals(newPin)) {
            throw new RuntimeException(
                    "New PIN must be different from current PIN!");
        }

        Account account = getAccountById(accountId);

        if (account.getCustomer() == null ||
                !account.getCustomer().getId().equals(customerId)) {

            throw new RuntimeException("Unauthorized account access!");
        }

        if (!"ACTIVE".equalsIgnoreCase(account.getStatus())) {
            throw new RuntimeException("Account is not active!");
        }

        if (account.getPin() == null ||
                !passwordEncoder.matches(currentPin, account.getPin())) {

            throw new RuntimeException(
                    "Current PIN is incorrect or PIN is not set!");
        }

        account.setPin(passwordEncoder.encode(newPin));

        accountRepository.save(account);
    }

    // Get Account PIN Status
    @Transactional(readOnly = true)
    public boolean isPinSet(Long accountId, Long customerId) {

        Account account = getAccountById(accountId);

        if (account.getCustomer() == null ||
                !account.getCustomer().getId().equals(customerId)) {

            throw new RuntimeException("Unauthorized account access!");
        }

        return account.getPin() != null;
    }
}
