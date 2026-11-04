# 🏦 SecureBank – Backend #


A secure and scalable REST API backend for the **Bank Management System Web – SecureBank**, developed using Java and Spring Boot.

The backend handles authentication, customer management, bank accounts, transactions, and administrative operations.



# 🚀 Live Backend:-

Backend URL:-
      https://bank-management-system-web.onrender.com


Health Check:-
      https://bank-management-system-web.onrender.com/health



# 🛠️ Technology Stack:-

- Java 17
- Spring Boot
- Spring Data JPA
- Spring Security
- JWT Authentication
- BCrypt Password Encryption
- Maven
- TiDB Cloud
- MySQL Compatible Database



# ✨ Features:-

# Authentication & Authorization:-

- Customer Registration
- Customer Login
- Admin Login
- JWT Token Generation
- JWT-Based Authentication
- BCrypt Password Hashing
- Role-Based Access Control



# Customer Management:-
- Retrieve Customer Details
- View Customer Information
- Customer Data Management



# Account Management:-
- Bank Account Creation
- Account Details
- Account Balance Management
- Account Status Management
- Active and Frozen Account Management



# Transaction Management:-
- Deposit Money
- Withdraw Money
- Transaction History
- Account-Based Transactions
- Transaction Statistics



# Admin Operations:-
- Admin Dashboard Statistics
- Customer Management
- Account Management
- Transaction Monitoring



# 🏗️ Backend Architecture:-

Client (React.js)
       |
       | REST API + JWT
       ▼
Spring Boot Backend
       |
       ├── Controller Layer
       ├── Service Layer
       ├── Repository Layer
       ├── Entity Layer
       └── Security Layer
       |
       ▼
TiDB Cloud Database
(MySQL Compatible)



# 📂 Project Structure:-

Backend/
│
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/bank/banking/
│   │   │       ├── controller/
│   │   │       ├── service/
│   │   │       ├── repository/
│   │   │       ├── entity/
│   │   │       ├── config/
│   │   │       └── security/
│   │   │
│   │   └── resources/
│   │       └── application.properties
│   │
│   └── test/
│
├── pom.xml
└── Dockerfile



# 🔗 API Configuration:-

API Base URL:-
      https://bank-management-system-web.onrender.com/api


Health Endpoint:-
      GET /health



# 🗄️ Database Configuration:-

The backend connects to **TiDB Cloud**, which provides MySQL-compatible database functionality.

Database operations are managed through Spring Data JPA and Hibernate.



# Main Entities:-

- Customer
- Account
- Transaction



# ⚙️ Local Installation & Setup:-

# Prerequisites:-

- Java 17
- Maven
- TiDB Cloud / MySQL Database



# 1. Clone Repository:-
   git clone https://github.com/samarth8698/Bank-Management-System-Web.git



# 2. Navigate to Backend:-
   cd Bank-Management-System-Web/Backend



# 3. Configure Environment Variables:-
   Configure database credentials and other sensitive properties in your environment.
   Never expose database passwords or JWT secrets publicly.



# 4. Run Backend:-
   mvn spring-boot:run


Backend starts at:-
      http://localhost:8080



# 🔒 Security:-

- JWT Authentication
- BCrypt Password Encryption
- Spring Security
- Role-Based Authorization
- Protected REST APIs
- Secure Environment Configuration



# 🚀 Deployment:-

The backend is deployed on **Render** and connected to **TiDB Cloud**.



## 👨‍💻 Developer:-
            Samarth Subhash Adhao
