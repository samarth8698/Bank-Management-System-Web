package com.bank.banking;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GeneratePassword {

    public static void main(String[] args) {

        BCryptPasswordEncoder encoder =
                new BCryptPasswordEncoder();

        // Admin Password
        String password = "Samarth@Admin2026";

        // Generate BCrypt Hash
        String hash = encoder.encode(password);

        System.out.println("ADMIN PASSWORD: " + password);
        System.out.println("BCrypt HASH: " + hash);

        // Verify Password
        boolean match = encoder.matches(password, hash);

        System.out.println("PASSWORD MATCH: " + match);
    }
}
