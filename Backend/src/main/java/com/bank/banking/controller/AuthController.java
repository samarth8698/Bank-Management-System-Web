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

    // Customer Registration
    @PostMapping("/register")
    public ResponseEntity<Customer> register(
            @RequestBody Customer customer) {

        Customer registeredCustomer =
                authService.registerCustomer(customer);

        registeredCustomer.setPassword(null);

        return ResponseEntity.ok(registeredCustomer);
    }

    // Customer Login
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(
            @RequestBody Customer loginRequest) {

        String token = authService.loginCustomer(
                loginRequest.getEmail(),
                loginRequest.getPassword()
        );

        String role = authService.getUserRole(
                loginRequest.getEmail()
        );

        return ResponseEntity.ok(
                Map.of(
                        "token", token,
                        "role", role
                )
        );
    }

    // Forgot Password - Send OTP
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @RequestBody Map<String, String> request) {

        String email = request.get("email");

        authService.sendPasswordResetOTP(email);

        return ResponseEntity.ok(
                Map.of("message", "OTP sent successfully to your email!")
        );
    }

    // Verify OTP
    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, String>> verifyOTP(
            @RequestBody Map<String, String> request) {

        String email = request.get("email");
        String otp = request.get("otp");

        authService.verifyPasswordResetOTP(email, otp);

        return ResponseEntity.ok(
                Map.of("message", "OTP verified successfully!")
        );
    }

    // Reset Password
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @RequestBody Map<String, String> request) {

        String email = request.get("email");
        String newPassword = request.get("newPassword");

        authService.resetPassword(email, newPassword);

        return ResponseEntity.ok(
                Map.of("message", "Password reset successfully!")
        );
    }
}
