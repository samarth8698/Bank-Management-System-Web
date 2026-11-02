package com.bank.banking.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "customers")
public class Customer {

@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

private String firstName;

private String lastName;

@Column(nullable = false, unique = true)
private String email;

@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
@Column(nullable = false)
private String password;

private String phone;

private String address;

private String city;

private String state;

private String pincode;

// User Role
@Column(nullable = false)
private String role = "CUSTOMER";

// Default Constructor
public Customer() {
}

// Getters and Setters

public Long getId() {
    return id;
}

public void setId(Long id) {
    this.id = id;
}

public String getFirstName() {
    return firstName;
}

public void setFirstName(String firstName) {
    this.firstName = firstName;
}

public String getLastName() {
    return lastName;
}

public void setLastName(String lastName) {
    this.lastName = lastName;
}

public String getEmail() {
    return email;
}

public void setEmail(String email) {
    this.email = email;
}

public String getPassword() {
    return password;
}

public void setPassword(String password) {
    this.password = password;
}

public String getPhone() {
    return phone;
}

public void setPhone(String phone) {
    this.phone = phone;
}

public String getAddress() {
    return address;
}

public void setAddress(String address) {
    this.address = address;
}

public String getCity() {
    return city;
}

public void setCity(String city) {
    this.city = city;
}

public String getState() {
    return state;
}

public void setState(String state) {
    this.state = state;
}

public String getPincode() {
    return pincode;
}

public void setPincode(String pincode) {
    this.pincode = pincode;
}

// Role Getter and Setter
public String getRole() {
    return role;
}

public void setRole(String role) {
    this.role = role;
}

}
