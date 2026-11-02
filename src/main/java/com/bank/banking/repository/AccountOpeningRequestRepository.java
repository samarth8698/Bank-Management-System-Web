package com.bank.banking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.bank.banking.entity.AccountOpeningRequest;

import java.util.List;

@Repository
public interface AccountOpeningRequestRepository
        extends JpaRepository<AccountOpeningRequest, Long> {

    // Get requests by customer
    List<AccountOpeningRequest> findByCustomer_IdOrderByRequestDateDesc(
            Long customerId);

    // Get all requests sorted by date
    List<AccountOpeningRequest> findAllByOrderByRequestDateDesc();

    // Check pending request
    boolean existsByCustomer_IdAndStatus(
            Long customerId,
            String status);
}
