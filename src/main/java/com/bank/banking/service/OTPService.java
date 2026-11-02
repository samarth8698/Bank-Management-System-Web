package com.bank.banking.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bank.banking.entity.OtpVerification;
import com.bank.banking.repository.OtpVerificationRepository;

@Service
@Transactional
public class OTPService {

    private final OtpVerificationRepository otpRepository;
    private final PasswordEncoder passwordEncoder;

    private final SecureRandom secureRandom = new SecureRandom();

    public OTPService(
            OtpVerificationRepository otpRepository,
            PasswordEncoder passwordEncoder) {

        this.otpRepository = otpRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Generate OTP
    public String generateOTP(String email) {

        String normalizedEmail = normalizeEmail(email);

        // Generate 6-digit OTP
        String otp = String.format(
                "%06d",
                secureRandom.nextInt(1000000)
        );

        // Hash OTP before storing
        String otpHash = passwordEncoder.encode(otp);

        LocalDateTime expiryTime =
                LocalDateTime.now().plusMinutes(5);

        // Check existing OTP
        Optional<OtpVerification> existingOTP =
                otpRepository.findByEmail(normalizedEmail);

        OtpVerification otpVerification;

        if (existingOTP.isPresent()) {

            otpVerification = existingOTP.get();

        } else {

            otpVerification = new OtpVerification();
            otpVerification.setEmail(normalizedEmail);

        }

        otpVerification.setOtpHash(otpHash);
        otpVerification.setExpiryTime(expiryTime);

        otpRepository.save(otpVerification);

        return otp;
    }

    // Verify OTP
    public boolean verifyOTP(String email, String enteredOTP) {

        String normalizedEmail = normalizeEmail(email);

        if (enteredOTP == null || !enteredOTP.matches("\\d{6}")) {
            return false;
        }

        Optional<OtpVerification> optionalOTP =
                otpRepository.findByEmail(normalizedEmail);

        if (optionalOTP.isEmpty()) {
            return false;
        }

        OtpVerification otpData = optionalOTP.get();

        // Check OTP expiry
        if (LocalDateTime.now().isAfter(otpData.getExpiryTime())) {

            otpRepository.delete(otpData);

            return false;
        }

        // Compare entered OTP with stored hash
        boolean matches = passwordEncoder.matches(
                enteredOTP.trim(),
                otpData.getOtpHash()
        );

        if (!matches) {
            return false;
        }

        // Delete OTP after successful verification
        otpRepository.delete(otpData);

        return true;
    }

    // Normalize Email
    private String normalizeEmail(String email) {

        if (email == null || email.isBlank()) {

            throw new IllegalArgumentException(
                    "Email is required!"
            );
        }

        return email.trim().toLowerCase();
    }
}