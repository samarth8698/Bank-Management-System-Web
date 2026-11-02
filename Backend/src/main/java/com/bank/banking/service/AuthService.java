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

    // Verified OTP customers
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

    // Customer Registration
    public Customer registerCustomer(Customer customer) {

        if (customerRepository.findByEmail(customer.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered!");
        }

        String encodedPassword =
                passwordEncoder.encode(customer.getPassword());

        customer.setPassword(encodedPassword);

        // Always assign CUSTOMER role
        // Prevent users from registering as ADMIN
        customer.setRole("CUSTOMER");

        Customer savedCustomer = customerRepository.save(customer);

        // Send Welcome Email after successful database commit
        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {

                    @Override
                    public void afterCommit() {

                        try {
                            String name = savedCustomer.getFirstName();

                            emailService.sendWelcomeEmail(
                                    savedCustomer.getEmail(),
                                    name
                            );

                            logger.info(
                                    "Welcome email sent to {}",
                                    savedCustomer.getEmail()
                            );

                        } catch (Exception e) {

                            logger.error(
                                    "Welcome email failed for {}",
                                    savedCustomer.getEmail(),
                                    e
                            );
                        }
                    }
                }
        );

        return savedCustomer;
    }

    // Customer Login
    public String loginCustomer(String email, String password) {

        String normalizedEmail = email.trim().toLowerCase();

        Customer customer = customerRepository.findByEmail(normalizedEmail)
                .orElseThrow(() ->
                        new RuntimeException("Invalid email or password!"));

        if (!passwordEncoder.matches(password, customer.getPassword())) {
            throw new RuntimeException("Invalid email or password!");
        }

        return jwtService.generateToken(customer);
    }

    // Get User Role
    public String getUserRole(String email) {

        String normalizedEmail = email.trim().toLowerCase();

        Customer customer = customerRepository.findByEmail(normalizedEmail)
                .orElseThrow(() ->
                        new RuntimeException("Customer not found!")
                );

        return customer.getRole();
    }

    // Forgot Password - Send OTP
    public void sendPasswordResetOTP(String email) {

        String normalizedEmail = email.trim().toLowerCase();

        Customer customer = customerRepository.findByEmail(normalizedEmail)
                .orElseThrow(() ->
                        new RuntimeException("Customer not found!"));

        String otp = otpService.generateOTP(normalizedEmail);

        emailService.sendOtpEmail(normalizedEmail, otp);
    }

    // Verify OTP
    public boolean verifyPasswordResetOTP(String email, String otp) {

        String normalizedEmail = email.trim().toLowerCase();

        boolean verified = otpService.verifyOTP(
                normalizedEmail,
                otp
        );

        if (!verified) {
            throw new RuntimeException("Invalid or expired OTP!");
        }

        verifiedEmails.put(
                normalizedEmail,
                LocalDateTime.now().plusMinutes(5)
        );

        return true;
    }

    // Reset Password
    public void resetPassword(String email, String newPassword) {

        String normalizedEmail = email.trim().toLowerCase();

        LocalDateTime expiry = verifiedEmails.get(normalizedEmail);

        if (expiry == null || LocalDateTime.now().isAfter(expiry)) {

            verifiedEmails.remove(normalizedEmail);

            throw new RuntimeException(
                    "Please verify OTP before resetting password!"
            );
        }

        Customer customer = customerRepository
                .findByEmail(normalizedEmail)
                .orElseThrow(() ->
                        new RuntimeException("Customer not found!")
                );

        String encodedPassword =
                passwordEncoder.encode(newPassword);

        customer.setPassword(encodedPassword);

        customerRepository.save(customer);

        verifiedEmails.remove(normalizedEmail);
    }
}
