package com.bank.banking.service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import com.bank.banking.entity.Customer;
import com.bank.banking.repository.CustomerRepository;

@Service
@Transactional
public class AuthService {

    private static final Logger logger =
            LoggerFactory.getLogger(AuthService.class);

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final OTPService otpService;

    private final Map<String, LocalDateTime> verifiedEmails =
            new ConcurrentHashMap<>();

    public AuthService(
            CustomerRepository customerRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            EmailService emailService,
            OTPService otpService) {

        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.otpService = otpService;
    }

    // ================= REGISTER CUSTOMER =================

    public Customer registerCustomer(Customer customer) {

        if (customer.getEmail() == null
                || customer.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Email is required!");
        }

        String email = customer.getEmail()
                .trim()
                .toLowerCase();

        if (customerRepository
                .findByEmailIgnoreCase(email)
                .isPresent()) {

            throw new RuntimeException("Email already registered!");
        }

        customer.setEmail(email);

        customer.setPassword(
                passwordEncoder.encode(customer.getPassword()));

        customer.setRole("CUSTOMER");

        Customer savedCustomer =
                customerRepository.save(customer);

        // Send Welcome Email After Transaction Commit
        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {

                    @Override
                    public void afterCommit() {

                        try {

                            emailService.sendWelcomeEmail(
                                    savedCustomer.getEmail(),
                                    savedCustomer.getFirstName());

                            logger.info(
                                    "Welcome email sent to {}",
                                    savedCustomer.getEmail());

                        } catch (Exception e) {

                            logger.error(
                                    "Welcome email failed",
                                    e);
                        }
                    }
                });

        return savedCustomer;
    }

    // ================= LOGIN CUSTOMER =================

    public String loginCustomer(
            String email,
            String password) {

        if (email == null || password == null) {
            throw new RuntimeException(
                    "Email and password are required!");
        }

        String normalizedEmail = email
                .trim()
                .toLowerCase();

        Customer customer = customerRepository
                .findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Invalid email or password!"));

        if (!passwordEncoder.matches(
                password,
                customer.getPassword())) {

            throw new RuntimeException(
                    "Invalid email or password!");
        }

        logger.info(
                "Login successful: Email={}, Role={}",
                customer.getEmail(),
                customer.getRole());

        return jwtService.generateToken(customer);
    }

    // ================= GET CUSTOMER BY EMAIL =================

    @Transactional(readOnly = true)
    public Customer getCustomerByEmail(String email) {

        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException("Email is required!");
        }

        String normalizedEmail = email
                .trim()
                .toLowerCase();

        return customerRepository
                .findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer not found!"));
    }

    // ================= GET USER ROLE =================

    @Transactional(readOnly = true)
    public String getUserRole(String email) {

        Customer customer =
                getCustomerByEmail(email);

        return customer.getRole();
    }

    // ================= FORGOT PASSWORD =================

    public void sendPasswordResetOTP(String email) {

        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException("Email is required!");
        }

        String normalizedEmail = email
                .trim()
                .toLowerCase();

        logger.info(
                "Forgot Password request: {}",
                normalizedEmail);

        Customer customer = customerRepository
                .findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> {

                    logger.error(
                            "Customer not found: {}",
                            normalizedEmail);

                    return new RuntimeException(
                            "Customer not found!");
                });

        String otp =
                otpService.generateOTP(normalizedEmail);

        emailService.sendOtpEmail(
                normalizedEmail,
                otp);

        logger.info(
                "OTP email sent to {}",
                normalizedEmail);
    }

    // ================= VERIFY OTP =================

    public boolean verifyPasswordResetOTP(
            String email,
            String otp) {

        if (email == null || otp == null) {
            throw new RuntimeException(
                    "Email and OTP are required!");
        }

        String normalizedEmail = email
                .trim()
                .toLowerCase();

        boolean verified = otpService.verifyOTP(
                normalizedEmail,
                otp);

        if (!verified) {
            throw new RuntimeException(
                    "Invalid or expired OTP!");
        }

        verifiedEmails.put(
                normalizedEmail,
                LocalDateTime.now().plusMinutes(5));

        logger.info(
                "OTP verified successfully for {}",
                normalizedEmail);

        return true;
    }

    // ================= RESET PASSWORD =================

    public void resetPassword(
            String email,
            String newPassword) {

        if (email == null
                || newPassword == null
                || newPassword.trim().isEmpty()) {

            throw new RuntimeException(
                    "Email and new password are required!");
        }

        String normalizedEmail = email
                .trim()
                .toLowerCase();

        LocalDateTime expiry =
                verifiedEmails.get(normalizedEmail);

        if (expiry == null
                || LocalDateTime.now().isAfter(expiry)) {

            verifiedEmails.remove(normalizedEmail);

            throw new RuntimeException(
                    "Please verify OTP before resetting password!");
        }

        Customer customer = customerRepository
                .findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer not found!"));

        customer.setPassword(
                passwordEncoder.encode(newPassword));

        customerRepository.save(customer);

        verifiedEmails.remove(normalizedEmail);

        logger.info(
                "Password reset successful for {}",
                normalizedEmail);
    }
}
