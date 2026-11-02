package com.bank.banking.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "accounts")
public class Account {

@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

@Column(unique = true, nullable = false)
private String accountNumber;

private String accountType;

private BigDecimal balance;

private LocalDate openingDate;

private String status;

@ManyToOne
@JoinColumn(name = "customer_id", nullable = false)
private Customer customer;

// Secure PIN Storage
@JsonIgnore
@Column(name = "pin")
private String pin;

// Default Constructor
public Account() {
}

// Getters and Setters

public Long getId() {
    return id;
}

public void setId(Long id) {
    this.id = id;
}

public String getAccountNumber() {
    return accountNumber;
}

public void setAccountNumber(String accountNumber) {
    this.accountNumber = accountNumber;
}

public String getAccountType() {
    return accountType;
}

public void setAccountType(String accountType) {
    this.accountType = accountType;
}

public BigDecimal getBalance() {
    return balance;
}

public void setBalance(BigDecimal balance) {
    this.balance = balance;
}

public LocalDate getOpeningDate() {
    return openingDate;
}

public void setOpeningDate(LocalDate openingDate) {
    this.openingDate = openingDate;
}

public String getStatus() {
    return status;
}

public void setStatus(String status) {
    this.status = status;
}

public Customer getCustomer() {
    return customer;
}

public void setCustomer(Customer customer) {
    this.customer = customer;
}

public String getPin() {
    return pin;
}

public void setPin(String pin) {
    this.pin = pin;
}

}
