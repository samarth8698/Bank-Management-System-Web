package com.bank.banking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.bank.banking.entity.Transaction;

import java.math.BigDecimal;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // Find Transactions By Account ID
    List<Transaction> findByAccountId(Long accountId);

    // Find Transactions By Account ID - Latest First
    List<Transaction> findByAccountIdOrderByTransactionDateDesc(Long accountId);

    // Find All Transactions - Latest First
    List<Transaction> findAllByOrderByTransactionDateDesc();

    // Total Amount By Transaction Type
    @Query("""
        SELECT COALESCE(SUM(t.amount), 0)
        FROM Transaction t
        WHERE t.transactionType = :type
    """)
    BigDecimal getTotalByTransactionType(@Param("type") String type);
}
