package com.bank.banking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.bank.banking.entity.Transaction;

import java.math.BigDecimal;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByAccountId(Long accountId);

    List<Transaction> findByAccountIdOrderByTransactionDateDesc(Long accountId);

    List<Transaction> findAllByOrderByTransactionDateDesc();

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.transactionType = :type")
    BigDecimal getTotalByTransactionType(@Param("type") String type);
}