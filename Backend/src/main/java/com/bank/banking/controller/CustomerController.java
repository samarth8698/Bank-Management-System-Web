package com.bank.banking.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import com.bank.banking.entity.Customer;
import com.bank.banking.service.CustomerService;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "http://localhost:5173")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    // Add Customer
    @PostMapping
    public ResponseEntity<Customer> addCustomer(
            @RequestBody Customer customer) {

        return ResponseEntity.ok(customerService.addCustomer(customer));
    }

    // Get All Customers
    @GetMapping
    public ResponseEntity<List<Customer>> getAllCustomers() {

        return ResponseEntity.ok(customerService.getAllCustomers());
    }

    // Get Customer By ID
    @GetMapping("/{id}")
    public ResponseEntity<Customer> getCustomerById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                customerService.getCustomerById(id)
                        .orElseThrow(() -> new RuntimeException("Customer not found!"))
        );
    }

    // Update Customer
    @PutMapping("/{id}")
    public ResponseEntity<Customer> updateCustomer(
            @PathVariable Long id,
            @RequestBody Customer customer) {

        return ResponseEntity.ok(
                customerService.updateCustomer(id, customer)
        );
    }

    // Get My Profile
    @GetMapping("/me")
    public ResponseEntity<Customer> getMyProfile(
            @AuthenticationPrincipal Customer loggedInCustomer) {

        return ResponseEntity.ok(
                customerService.getMyProfile(loggedInCustomer.getId())
        );
    }

    // Update My Profile
    @PutMapping("/me")
    public ResponseEntity<Customer> updateMyProfile(
            @AuthenticationPrincipal Customer loggedInCustomer,
            @RequestBody Customer customer) {

        return ResponseEntity.ok(
                customerService.updateMyProfile(
                        loggedInCustomer.getId(),
                        customer
                )
        );
    }

    // Delete Customer
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCustomer(
            @PathVariable Long id) {

        customerService.deleteCustomer(id);

        return ResponseEntity.ok("Customer deleted successfully!");
    }
}