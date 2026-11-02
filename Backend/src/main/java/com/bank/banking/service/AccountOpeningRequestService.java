package com.bank.banking.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bank.banking.entity.Account;
import com.bank.banking.entity.AccountOpeningRequest;
import com.bank.banking.entity.Customer;

import com.bank.banking.repository.AccountOpeningRequestRepository;
import com.bank.banking.repository.CustomerRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class AccountOpeningRequestService {

    private final AccountOpeningRequestRepository requestRepository;
    private final CustomerRepository customerRepository;
    private final AccountService accountService;

    public AccountOpeningRequestService(
            AccountOpeningRequestRepository requestRepository,
            CustomerRepository customerRepository,
            AccountService accountService) {

        this.requestRepository = requestRepository;
        this.customerRepository = customerRepository;
        this.accountService = accountService;
    }

    // Customer: Submit Account Opening Request
    public AccountOpeningRequest submitRequest(
            Customer customer,
            String accountType) {

        if (accountType == null || accountType.isBlank()) {
            throw new RuntimeException("Account type is required!");
        }

        String normalizedType = accountType.trim().toUpperCase();

        if (!normalizedType.equals("SAVINGS")
                && !normalizedType.equals("CURRENT")) {

            throw new RuntimeException(
                    "Invalid account type! Choose SAVINGS or CURRENT.");
        }

        boolean pendingRequest =
                requestRepository.existsByCustomer_IdAndStatus(
                        customer.getId(), "PENDING");

        if (pendingRequest) {
            throw new RuntimeException(
                    "You already have a pending account opening request!");
        }

        AccountOpeningRequest request = new AccountOpeningRequest();

        request.setCustomer(customer);
        request.setAccountType(normalizedType);
        request.setStatus("PENDING");
        request.setRequestDate(LocalDateTime.now());

        return requestRepository.save(request);
    }

    // Customer: Get Own Requests
    @Transactional(readOnly = true)
    public List<AccountOpeningRequest> getMyRequests(Long customerId) {

        return requestRepository
                .findByCustomer_IdOrderByRequestDateDesc(customerId);
    }

    // Admin: Get All Requests
    @Transactional(readOnly = true)
    public List<AccountOpeningRequest> getAllRequests() {

        return requestRepository
                .findAllByOrderByRequestDateDesc();
    }

    // Admin: Approve Request
    public Account approveRequest(Long requestId) {

        AccountOpeningRequest request =
                requestRepository.findById(requestId)
                        .orElseThrow(() -> new RuntimeException(
                                "Account opening request not found!"));

        if (!"PENDING".equalsIgnoreCase(request.getStatus())) {
            throw new RuntimeException(
                    "Only pending requests can be approved!");
        }

        Customer customer = customerRepository
                .findById(request.getCustomer().getId())
                .orElseThrow(() -> new RuntimeException(
                        "Customer not found!"));

        Account account = new Account();

        account.setAccountType(request.getAccountType());

        // Existing Account Creation Logic
        Account createdAccount =
                accountService.createMyAccount(customer, account);

        request.setStatus("APPROVED");
        request.setReviewedDate(LocalDateTime.now());

        requestRepository.save(request);

        return createdAccount;
    }

    // Admin: Reject Request
    public AccountOpeningRequest rejectRequest(
            Long requestId,
            String rejectionReason) {

        AccountOpeningRequest request =
                requestRepository.findById(requestId)
                        .orElseThrow(() -> new RuntimeException(
                                "Account opening request not found!"));

        if (!"PENDING".equalsIgnoreCase(request.getStatus())) {
            throw new RuntimeException(
                    "Only pending requests can be rejected!");
        }

        if (rejectionReason == null || rejectionReason.isBlank()) {
            throw new RuntimeException(
                    "Rejection reason is required!");
        }

        request.setStatus("REJECTED");
        request.setRejectionReason(rejectionReason.trim());
        request.setReviewedDate(LocalDateTime.now());

        return requestRepository.save(request);
    }
}
