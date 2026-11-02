package com.bank.banking.filter;

import java.io.IOException;
import java.util.Collections;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.bank.banking.entity.Customer;
import com.bank.banking.repository.CustomerRepository;
import com.bank.banking.service.JwtService;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JWTAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomerRepository customerRepository;

    public JWTAuthenticationFilter(
            JwtService jwtService,
            CustomerRepository customerRepository) {

        this.jwtService = jwtService;
        this.customerRepository = customerRepository;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {

        String path = request.getServletPath();

        return path.startsWith("/api/auth/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        System.out.println("\n========== JWT DEBUG START ==========");

        System.out.println("REQUEST URL: " + request.getRequestURI());

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {

            System.out.println("JWT ERROR: Authorization Header Missing");

            filterChain.doFilter(request, response);
            return;
        }

        System.out.println("AUTHORIZATION HEADER FOUND");

        String token = authHeader.substring(7);

        try {

            // Extract Email
            String email = jwtService.extractEmail(token);

            System.out.println("TOKEN EMAIL: " + email);

            if (email != null &&
                    SecurityContextHolder.getContext().getAuthentication() == null) {

                // Find Customer
                Customer customer = customerRepository.findByEmail(email)
                        .orElse(null);

                System.out.println("CUSTOMER FOUND: " + (customer != null));

                if (customer != null) {

                    System.out.println("CUSTOMER ID: " + customer.getId());
                    System.out.println("CUSTOMER ROLE: " + customer.getRole());

                    // Validate Token
                    boolean validToken =
                            jwtService.validateToken(token, customer);

                    System.out.println("TOKEN VALID: " + validToken);

                    if (validToken) {

                        String role = customer.getRole();

                        if (role == null || role.isBlank()) {
                            role = "CUSTOMER";
                        }

                        role = role.toUpperCase();

                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(
                                        customer,
                                        null,
                                        Collections.singletonList(
                                                new SimpleGrantedAuthority("ROLE_" + role)
                                        )
                                );

                        authentication.setDetails(
                                new WebAuthenticationDetailsSource()
                                        .buildDetails(request)
                        );

                        SecurityContextHolder.getContext()
                                .setAuthentication(authentication);

                        System.out.println("AUTHENTICATION SUCCESS");
                        System.out.println("AUTHORITY: ROLE_" + role);

                    } else {

                        System.out.println("JWT ERROR: Token Validation Failed");
                    }

                } else {

                    System.out.println("JWT ERROR: Customer Not Found");
                }

            } else {

                System.out.println("JWT ERROR: Email Missing or Already Authenticated");
            }

        } catch (JwtException | IllegalArgumentException exception) {

            System.out.println("JWT ERROR: " + exception.getMessage());

            exception.printStackTrace();
        }

        System.out.println("========== JWT DEBUG END ==========\n");

        filterChain.doFilter(request, response);
    }
}