package com.bank.banking.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.bank.banking.entity.Account;
import com.bank.banking.entity.AccountOpeningRequest;
import com.bank.banking.entity.Customer;
import com.bank.banking.service.AccountOpeningRequestService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/account-opening")
@CrossOrigin(origins = "http://localhost:5173")
public class AccountOpeningRequestController {

    private final AccountOpeningRequestService requestService;

    public AccountOpeningRequestController(
            AccountOpeningRequestService requestService) {
        this.requestService = requestService;
    }

    // Customer: Submit Account Opening Request
    @PostMapping("/apply")
    public ResponseEntity<AccountOpeningRequest> submitRequest(
            @AuthenticationPrincipal Customer customer,
            @RequestBody Map<String, String> request) {

        AccountOpeningRequest savedRequest =
                requestService.submitRequest(
                        customer,
                        request.get("accountType"));

        return ResponseEntity.ok(savedRequest);
    }

    // Customer: Get Own Requests
    @GetMapping("/my-requests")
    public ResponseEntity<List<AccountOpeningRequest>> getMyRequests(
            @AuthenticationPrincipal Customer customer) {

        return ResponseEntity.ok(
                requestService.getMyRequests(customer.getId()));
    }

    // Admin: Get All Requests
    @GetMapping("/admin/all")
    public ResponseEntity<List<AccountOpeningRequest>> getAllRequests() {

        return ResponseEntity.ok(
                requestService.getAllRequests());
    }

    // Admin: Approve Request
    @PatchMapping("/admin/{requestId}/approve")
    public ResponseEntity<Account> approveRequest(
            @PathVariable Long requestId) {

        return ResponseEntity.ok(
                requestService.approveRequest(requestId));
    }

    // Admin: Reject Request
    @PatchMapping("/admin/{requestId}/reject")
    public ResponseEntity<AccountOpeningRequest> rejectRequest(
            @PathVariable Long requestId,
            @RequestBody Map<String, String> request) {

        return ResponseEntity.ok(
                requestService.rejectRequest(
                        requestId,
                        request.get("rejectionReason")));
    }
}
