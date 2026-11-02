package com.bank.banking.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.bank.banking.entity.Account;
import com.bank.banking.entity.Customer;
import com.bank.banking.entity.Transaction;
import com.bank.banking.repository.AccountRepository;
import com.bank.banking.repository.TransactionRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class TransactionService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public TransactionService(
            AccountRepository accountRepository,
            TransactionRepository transactionRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService) {

        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    // Deposit Money
    public Transaction deposit(
            Long accountId,
            Long customerId,
            BigDecimal amount) {

        validateAmount(amount);

        Account account = getCustomerAccount(accountId, customerId);

        account.setBalance(account.getBalance().add(amount));

        accountRepository.save(account);

        Transaction transaction = saveTransaction(
                account,
                "DEPOSIT",
                amount,
                "Money deposited");

        // Deposit Email Notification
        Customer customer = account.getCustomer();

        String email = customer.getEmail();
        String name = getCustomerName(customer);
        String accountNumber = String.valueOf(account.getAccountNumber());

        sendEmailAfterCommit(() ->
                emailService.sendDepositEmail(
                        email,
                        name,
                        amount.doubleValue(),
                        accountNumber
                )
        );

        return transaction;
    }

    // Withdraw Money
    public Transaction withdraw(
            Long accountId,
            Long customerId,
            BigDecimal amount) {

        validateAmount(amount);

        Account account = getCustomerAccount(accountId, customerId);

        if (account.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient balance!");
        }

        account.setBalance(account.getBalance().subtract(amount));

        accountRepository.save(account);

        Transaction transaction = saveTransaction(
                account,
                "WITHDRAWAL",
                amount,
                "Money withdrawn");

        // Withdrawal Email Notification
        Customer customer = account.getCustomer();

        String email = customer.getEmail();
        String name = getCustomerName(customer);
        String accountNumber = String.valueOf(account.getAccountNumber());

        sendEmailAfterCommit(() ->
                emailService.sendWithdrawalEmail(
                        email,
                        name,
                        amount.doubleValue(),
                        accountNumber
                )
        );

        return transaction;
    }

    // Fund Transfer
    public String transfer(
            Long senderAccountId,
            Long customerId,
            String receiverAccountNumber,
            BigDecimal amount,
            String pin) {

        // Validate Amount
        validateAmount(amount);

        // Validate Receiver Account Number
        if (receiverAccountNumber == null ||
                receiverAccountNumber.trim().isEmpty()) {

            throw new RuntimeException(
                    "Receiver account number is required!");
        }

        // Validate ATM PIN
        if (pin == null || !pin.matches("\\d{6}")) {
            throw new RuntimeException(
                    "Please enter a valid 6-digit ATM PIN!");
        }

        // Get Sender Account
        Account senderAccount =
                getCustomerAccount(senderAccountId, customerId);

        // Verify Sender PIN
        if (senderAccount.getPin() == null ||
                !passwordEncoder.matches(pin, senderAccount.getPin())) {

            throw new RuntimeException("Incorrect ATM PIN!");
        }

        // Find Receiver Account
        Account receiverAccount = accountRepository
                .findByAccountNumber(receiverAccountNumber.trim())
                .orElseThrow(() ->
                        new RuntimeException("Receiver account not found!"));

        // Verify Receiver Account Status
        if (!"ACTIVE".equalsIgnoreCase(receiverAccount.getStatus())) {
            throw new RuntimeException(
                    "Receiver account is not active!");
        }

        // Prevent Self Transfer
        if (senderAccount.getId().equals(receiverAccount.getId())) {
            throw new RuntimeException(
                    "You cannot transfer money to your own account!");
        }

        // Check Sender Balance
        if (senderAccount.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient balance!");
        }

        // Generate Common Reference Number
        String referenceNumber = UUID.randomUUID().toString();

        // Deduct Money From Sender
        senderAccount.setBalance(
                senderAccount.getBalance().subtract(amount));

        // Add Money To Receiver
        receiverAccount.setBalance(
                receiverAccount.getBalance().add(amount));

        // Save Both Accounts
        accountRepository.save(senderAccount);
        accountRepository.save(receiverAccount);

        // Sender Transaction
        saveTransaction(
                senderAccount,
                "TRANSFER_DEBIT",
                amount,
                "Money transferred to account " +
                        receiverAccount.getAccountNumber(),
                referenceNumber
        );

        // Receiver Transaction
        saveTransaction(
                receiverAccount,
                "TRANSFER_CREDIT",
                amount,
                "Money received from account " +
                        senderAccount.getAccountNumber(),
                referenceNumber
        );

        // Transfer Email Notifications
        Customer senderCustomer = senderAccount.getCustomer();
        Customer receiverCustomer = receiverAccount.getCustomer();

        String senderEmail = senderCustomer.getEmail();
        String senderName = getCustomerName(senderCustomer);

        String receiverEmail = receiverCustomer.getEmail();
        String receiverName = getCustomerName(receiverCustomer);

        sendEmailAfterCommit(() -> {

            // Sender Notification
            emailService.sendTransferEmail(
                    senderEmail,
                    senderName,
                    amount.doubleValue(),
                    referenceNumber
            );

            // Receiver Notification
            emailService.sendTransferEmail(
                    receiverEmail,
                    receiverName,
                    amount.doubleValue(),
                    referenceNumber
            );

        });

        return "Money transferred successfully! Reference Number: "
                + referenceNumber;
    }

    // Get Transaction History
    @Transactional(readOnly = true)
    public List<Transaction> getTransactionHistory(
            Long accountId,
            Long customerId) {

        getCustomerAccount(accountId, customerId);

        return transactionRepository
                .findByAccountIdOrderByTransactionDateDesc(accountId);
    }

    // Get Current Balance
    @Transactional(readOnly = true)
    public BigDecimal getBalance(
            Long accountId,
            Long customerId) {

        return getCustomerAccount(accountId, customerId).getBalance();
    }

    // Validate Amount
    private void validateAmount(BigDecimal amount) {

        if (amount == null ||
                amount.compareTo(BigDecimal.ZERO) <= 0) {

            throw new RuntimeException(
                    "Amount must be greater than zero!");
        }
    }

    // Verify Account Ownership
    private Account getCustomerAccount(
            Long accountId,
            Long customerId) {

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() ->
                        new RuntimeException("Account not found!"));

        if (!account.getCustomer().getId().equals(customerId)) {
            throw new RuntimeException(
                    "You are not authorized to access this account!");
        }

        if (!"ACTIVE".equalsIgnoreCase(account.getStatus())) {
            throw new RuntimeException("Account is not active!");
        }

        return account;
    }

    // Get Customer Full Name
    private String getCustomerName(Customer customer) {

        return customer.getFirstName() + " " +
                customer.getLastName();
    }

    // Send Email After Database Transaction Commit
    private void sendEmailAfterCommit(Runnable emailTask) {

        if (TransactionSynchronizationManager
                .isActualTransactionActive()) {

            TransactionSynchronizationManager.registerSynchronization(
                    new TransactionSynchronization() {

                        @Override
                        public void afterCommit() {

                            try {
                                emailTask.run();

                            } catch (Exception ex) {

                                System.err.println(
                                        "Email notification failed: "
                                                + ex.getMessage());
                            }
                        }
                    }
            );

        } else {

            try {
                emailTask.run();

            } catch (Exception ex) {

                System.err.println(
                        "Email notification failed: "
                                + ex.getMessage());
            }
        }
    }

    // Save Transaction - Generate New Reference Number
    private Transaction saveTransaction(
            Account account,
            String type,
            BigDecimal amount,
            String description) {

        String referenceNumber = UUID.randomUUID().toString();

        return saveTransaction(
                account,
                type,
                amount,
                description,
                referenceNumber);
    }

    // Save Transaction - Use Common Reference Number
    private Transaction saveTransaction(
            Account account,
            String type,
            BigDecimal amount,
            String description,
            String referenceNumber) {

        Transaction transaction = new Transaction();

        transaction.setAccount(account);
        transaction.setTransactionType(type);
        transaction.setAmount(amount);
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setDescription(description);
        transaction.setReferenceNumber(referenceNumber);
        transaction.setStatus("SUCCESS");

        return transactionRepository.save(transaction);
    }
}