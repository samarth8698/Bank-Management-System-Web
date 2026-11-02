package com.bank.banking.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.bank.banking.entity.Account;
import com.bank.banking.entity.Customer;
import com.bank.banking.service.AccountService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(origins = "http://localhost:5173")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    // Create Account For Customer
    @PostMapping("/customer/{customerId}")
    public ResponseEntity<Account> createAccount(
            @PathVariable Long customerId,
            @RequestBody Account account) {

        return ResponseEntity.ok(
                accountService.createAccount(customerId, account));
    }

    // Create Account For Logged-in Customer
    @PostMapping("/my-account")
    public ResponseEntity<Account> createMyAccount(
            @AuthenticationPrincipal Customer customer,
            @RequestBody Account account) {

        return ResponseEntity.ok(
                accountService.createMyAccount(customer, account));
    }

    // Get All Accounts
    @GetMapping
    public ResponseEntity<List<Account>> getAllAccounts() {

        return ResponseEntity.ok(accountService.getAllAccounts());
    }

    // Get Logged-in Customer Accounts
    @GetMapping("/my-accounts")
    public ResponseEntity<List<Account>> getMyAccounts(
            @AuthenticationPrincipal Customer customer) {

        return ResponseEntity.ok(
                accountService.getAccountsByCustomerId(customer.getId()));
    }

    // Get Account By ID
    @GetMapping("/{id}")
    public ResponseEntity<Account> getAccountById(
            @PathVariable Long id) {

        return ResponseEntity.ok(accountService.getAccountById(id));
    }

    // Get Account By Account Number
    @GetMapping("/number/{accountNumber}")
    public ResponseEntity<Account> getAccountByNumber(
            @PathVariable String accountNumber) {

        return ResponseEntity.ok(
                accountService.getAccountByNumber(accountNumber));
    }

    // Freeze / Unfreeze Account (ADMIN only)
    @PatchMapping("/{id}/status")
    public ResponseEntity<Account> updateAccountStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        return ResponseEntity.ok(
                accountService.updateAccountStatus(id, status));
    }

    // Set First PIN
    @PostMapping("/set-pin")
    public ResponseEntity<Map<String, String>> setPin(
            @AuthenticationPrincipal Customer customer,
            @RequestBody Map<String, String> request) {

        accountService.setPin(
                Long.valueOf(request.get("accountId")),
                customer.getId(),
                request.get("newPin"),
                request.get("confirmPin")
        );

        return ResponseEntity.ok(
                Map.of("message", "PIN set successfully!"));
    }

    // Change Existing PIN
    @PutMapping("/change-pin")
    public ResponseEntity<Map<String, String>> changePin(
            @AuthenticationPrincipal Customer customer,
            @RequestBody Map<String, String> request) {

        accountService.changePin(
                Long.valueOf(request.get("accountId")),
                customer.getId(),
                request.get("currentPin"),
                request.get("newPin"),
                request.get("confirmPin")
        );

        return ResponseEntity.ok(
                Map.of("message", "PIN changed successfully!"));
    }

    // Get My Account PIN Status (First Account)
    @GetMapping("/my-accounts/pin-status")
    public ResponseEntity<Map<String, Boolean>> getMyAccountPinStatus(
            @AuthenticationPrincipal Customer customer) {

        List<Account> accounts =
                accountService.getAccountsByCustomerId(customer.getId());

        boolean pinSet = !accounts.isEmpty()
                && accounts.get(0).getPin() != null;

        return ResponseEntity.ok(Map.of("pinSet", pinSet));
    }

    // Get Specific Account PIN Status
    @GetMapping("/{accountId}/pin-status")
    public ResponseEntity<Map<String, Boolean>> getAccountPinStatus(
            @PathVariable Long accountId,
            @AuthenticationPrincipal Customer customer) {

        boolean pinSet = accountService.isPinSet(
                accountId,
                customer.getId()
        );

        return ResponseEntity.ok(
                Map.of("pinSet", pinSet));
    }
}
