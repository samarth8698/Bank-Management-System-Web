package com.bank.banking.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bank.banking.entity.Customer;
import com.bank.banking.repository.CustomerRepository;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    // Add Customer
    public Customer addCustomer(Customer customer) {

        if (customerRepository.findByEmail(customer.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered!");
        }

        return customerRepository.save(customer);
    }

    // Get All Customers
    @Transactional(readOnly = true)
    public List<Customer> getAllCustomers() {

        return customerRepository.findAll();
    }

    // Get Customer By ID
    @Transactional(readOnly = true)
    public Optional<Customer> getCustomerById(Long id) {

        return customerRepository.findById(id);
    }

    // Update Customer
    public Customer updateCustomer(Long id, Customer updatedCustomer) {

        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found!"));

        customer.setFirstName(updatedCustomer.getFirstName());
        customer.setLastName(updatedCustomer.getLastName());
        customer.setEmail(updatedCustomer.getEmail());
        customer.setPhone(updatedCustomer.getPhone());
        customer.setAddress(updatedCustomer.getAddress());
        customer.setCity(updatedCustomer.getCity());
        customer.setState(updatedCustomer.getState());
        customer.setPincode(updatedCustomer.getPincode());

        return customerRepository.save(customer);
    }

    // Get My Profile
    @Transactional(readOnly = true)
    public Customer getMyProfile(Long customerId) {

        return customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found!"));
    }

    // Update My Profile
    public Customer updateMyProfile(Long customerId, Customer updatedCustomer) {

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found!"));

        customer.setFirstName(updatedCustomer.getFirstName());
        customer.setLastName(updatedCustomer.getLastName());
        customer.setPhone(updatedCustomer.getPhone());
        customer.setAddress(updatedCustomer.getAddress());
        customer.setCity(updatedCustomer.getCity());
        customer.setState(updatedCustomer.getState());
        customer.setPincode(updatedCustomer.getPincode());

        return customerRepository.save(customer);
    }

    // Delete Customer
    public void deleteCustomer(Long id) {

        if (!customerRepository.existsById(id)) {
            throw new RuntimeException("Customer not found!");
        }

        customerRepository.deleteById(id);
    }
}