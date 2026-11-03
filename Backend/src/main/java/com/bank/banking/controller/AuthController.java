package com.bank.banking.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.bank.banking.entity.Customer;
import com.bank.banking.service.AuthService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // ================= REGISTER =================
    @PostMapping("/register")
    public ResponseEntity<Customer> register(
            @RequestBody Customer customer) {

        Customer registeredCustomer =
                authService.registerCustomer(customer);

        registeredCustomer.setPassword(null);

        return ResponseEntity.ok(registeredCustomer);
    }

    // ================= LOGIN =================
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestBody Customer loginRequest) {

        String email = loginRequest.getEmail()
                .trim()
                .toLowerCase();

        // Generate JWT Token
        String token = authService.loginCustomer(
                email,
                loginRequest.getPassword()
        );

        // Fetch Customer Details
        Customer customer = authService.getCustomerByEmail(email);

        // Login Response
        return ResponseEntity.ok(
                Map.of(
                        "token", token,
                        "role", customer.getRole(),
                        "customerId", customer.getId(),
                        "email", customer.getEmail()
                )
        );
    }

    // ================= FORGOT PASSWORD =================
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @RequestBody Map<String, String> request) {

        String email = request.get("email");

        authService.sendPasswordResetOTP(email);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "OTP sent successfully to your email!"
                )
        );
    }

    // ================= VERIFY OTP =================
    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, String>> verifyOTP(
            @RequestBody Map<String, String> request) {

        String email = request.get("email");
        String otp = request.get("otp");

        authService.verifyPasswordResetOTP(email, otp);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "OTP verified successfully!"
                )
        );
    }

    // ================= RESET PASSWORD =================
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @RequestBody Map<String, String> request) {

        String email = request.get("email");
        String newPassword = request.get("newPassword");

        authService.resetPassword(email, newPassword);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Password reset successfully!"
                )
        );
    }
}
