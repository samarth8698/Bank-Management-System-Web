package com.bank.banking.service;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.bank.banking.entity.Customer;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

 // Generate JWT Token
    public String generateToken(Customer customer) {

        return Jwts.builder()
                .subject(customer.getEmail())
                .claim("customerId", customer.getId())
                .claim("role", customer.getRole())
                .issuedAt(new Date())
                .expiration(
                    new Date(System.currentTimeMillis() + 86400000)
                )
                .signWith(getSigningKey())
                .compact();
    }

    // Extract Email from Token
    public String extractEmail(String token) {

        return extractAllClaims(token).getSubject();
    }

    // Extract Customer ID from Token
    public Long extractCustomerId(String token) {

        return extractAllClaims(token).get("customerId", Long.class);
    }

    // Validate JWT Token
    public boolean validateToken(String token, Customer customer) {

        String email = extractEmail(token);

        return email.equals(customer.getEmail())
                && !isTokenExpired(token);
    }

    // Check Token Expiration
    private boolean isTokenExpired(String token) {

        return extractAllClaims(token)
                .getExpiration()
                .before(new Date());
    }

    // Extract All Claims
    private Claims extractAllClaims(String token) {

        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
