package com.bank.banking;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GeneratePassword {

    public static void main(String[] args) {

        BCryptPasswordEncoder encoder =
                new BCryptPasswordEncoder();

        String password = "12345678";

        String hash = encoder.encode(password);

        System.out.println("BCrypt Hash: " + hash);
    }
}
