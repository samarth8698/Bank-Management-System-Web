# 🗄️ SecureBank – Database #


Note:- Actual database credentials must be configured securely through environment variables.


Database component of the **Bank Management System Web – SecureBank**, designed to store and manage customer information, bank accounts, and financial transactions.

The application uses **TiDB Cloud**, a MySQL-compatible database platform, for persistent data storage.



# 🛠️ Technology Stack:-

- TiDB Cloud
- MySQL Compatible Database
- SQL
- Spring Data JPA
- Hibernate ORM



# 📌 Database Overview:-

The database stores and manages the following information:-

- Customer Details
- Bank Account Information
- Account Balances
- Deposit Transactions
- Withdrawal Transactions
- Transaction History




# 🗂️ Main Database Entities:-

# 1. Customer:-
Stores customer information and authentication-related data.

# 2. Account:-
Stores bank account details, account type, balance, and account status.

# 3. Transaction:-
Stores transaction details such as transaction type, amount, account reference, and transaction date.



# 🏗️ Database Architecture:-

           Spring Boot Backend
                   |
                   ▼
          Spring Data JPA
                   |
                   ▼
             Hibernate
                   |
                   ▼
            TiDB Cloud
          (MySQL Compatible)
                   |
          ┌────────┼────────┐
          ▼        ▼        ▼
       Customer  Account  Transaction




# 🔗 Database Relationships:-

Customer
   |
   | One Customer
   |
   ▼
Multiple Accounts
   |
   | One Account
   |
   ▼
Multiple Transactions



# ⚙️ Database Configuration:-

The backend connects to TiDB Cloud using JDBC.




# Example configuration:-

#  properties:-
spring.datasource.url=${DATABASE_URL}
spring.datasource.username=${DATABASE_USERNAME}
spring.datasource.password=${DATABASE_PASSWORD}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver




# 🔒 Database Security:-

- Database credentials are stored securely.
- Backend manages database access.
- Sensitive database credentials must not be committed to GitHub.
- Database operations are handled through Spring Data JPA.
- Database connections use JDBC.



# 🚀 Database Hosting:-

Platform:- TiDB Cloud  
Database Type:- MySQL Compatible  
Connection:- Spring Boot Backend



# 👨‍💻 Developer:-
            Samarth Subhash Adhao
