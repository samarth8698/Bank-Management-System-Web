package com.bank.banking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.bank.banking.entity.Account;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Long> {

    Optional<Account> findByAccountNumber(String accountNumber);

    List<Account> findByCustomer_Id(Long customerId);

    @Query("SELECT COALESCE(SUM(a.balance), 0) FROM Account a")
    BigDecimal getTotalBalance();
}