package com.bank.banking.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.bank.banking.entity.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    // Find customer by exact email
    Optional<Customer> findByEmail(String email);

    // Find customer ignoring email case
    Optional<Customer> findByEmailIgnoreCase(String email);

    // Find customer ignoring spaces and email case
    @Query(value = """
            SELECT *
            FROM customers
            WHERE LOWER(TRIM(email)) = LOWER(TRIM(:email))
            LIMIT 1
            """, nativeQuery = true)
    Optional<Customer> findCustomerByEmail(
            @Param("email") String email);

    // Count customers by role
    long countByRole(String role);
}
