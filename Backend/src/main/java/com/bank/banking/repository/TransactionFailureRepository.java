package com.bank.banking.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.bank.banking.entity.TransactionFailure;

@Repository
public interface TransactionFailureRepository
        extends JpaRepository<TransactionFailure, Long> {

    // Get all failed transactions - Latest first
    List<TransactionFailure> findAllByOrderByOccurredAtDesc();

    // Count failed transactions
    long countByStatus(String status);
}