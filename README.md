# 🏦 Bank Management System Web – SecureBank #



A full-stack banking application built using **React.js, Spring Boot, Java, and TiDB Cloud**. SecureBank provides secure banking operations for customers and a dedicated administration panel for managing customers, accounts, and transactions.



Technologies :-
    Java | Spring Boot | React.js | SQL | REST APIs | JWT


## 🌐 Live Application :-

| Frontend          | [SecureBank Web Application](https://bank-management-system-web-three.vercel.app) |

| Backend Health    | [Health Check](https://bank-management-system-web.onrender.com/health) |




 📌 Project Overview:-
 
SecureBank is a web-based Bank Management System designed to simplify banking operations.

The application supports customer registration, authentication, account management, deposits, withdrawals, transaction history, and administrative operations through a modern responsive interface.

The project follows a full-stack architecture with a React frontend, Spring Boot REST API backend, and a MySQL-compatible TiDB Cloud database.



✨ Features:-
        🔐 Authentication & Security:-
        
  - Customer Registration
  - Customer Login
  - Admin Login
  - JWT Authentication
  - BCrypt Password Encryption
  - Role-Based Access Control
  - Secure REST API Endpoints



    👤 Customer Features:-
- Customer Dashboard
- Bank Account Opening
- Account Details
- Deposit Money
- Withdraw Money
- Transaction History
- Account Balance Monitoring
- Profile Management



   🛠️ Admin Features:-
- Admin Dashboard
- Customer Management
- Account Management
- Transaction Monitoring
- Account Status Management
- Customer Search
- Dashboard Statistics



     📊 Dashboard Statistics:-
- Total Customers
- Total Accounts
- Total Balance
- Total Deposits
- Total Withdrawals
- Total Transactions



   🧰 Technology Stack:-
# Frontend:-
- React.js
- JavaScript
- HTML5
- CSS3
- Axios
- React Router
- Vite


# Backend:-
- Java
- Spring Boot
- Spring Data JPA
- Spring Security
- JWT
- Maven
- RESTful APIs


# Database:-
- TiDB Cloud
- MySQL Compatible Database
- SQL


# Deployment:-
- Vercel – Frontend Hosting
- Render – Backend Hosting
- TiDB Cloud – Database Hosting



# 🏗️ System Architecture:-

                  ┌─────────────────────┐
                  │        Users        │
                  │  Admin / Customer  │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │   React Frontend   │
                  │       Vercel        │
                  └──────────┬──────────┘
                             │
                      REST API / JWT
                             │
                             ▼
                  ┌─────────────────────┐
                  │   Spring Boot      │
                  │   Backend Render   │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │    TiDB Cloud      │
                  │  MySQL Compatible  │
                  └─────────────────────┘



# 📂 Project Structure:-

Bank-Management-System-Web/
│
├── Backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/bank/banking/
│   │       │       ├── controller/
│   │       │       ├── service/
│   │       │       ├── repository/
│   │       │       ├── entity/
│   │       │       ├── config/
│   │       │       └── security/
│   │       │
│   │       └── resources/
│   │           └── application.properties
│   │
│   ├── pom.xml
│   └── Dockerfile
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   ├── assets/
│   │   └── App.jsx
│   │
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json
│
├── Database/
│   └── SQL Scripts
│
├── .gitignore
├── Dockerfile
├── vercel.json
└── README.md



#🗄️ Database Design:-
-The application uses **TiDB Cloud**, a MySQL-compatible database platform.




# Main Entities:-
- Customer
- Account
- Transaction



# Database Operations:-
- Customer Registration Records
- Bank Account Management
- Account Balance Management
- Deposit Transactions
- Withdrawal Transactions
- Transaction History



#🔗 Backend API:-
    # API Base URL:-
              -https://bank-management-system-web.onrender.com/health

   # Health Check Endpoint:-
              -GET /health

The health endpoint verifies backend availability.



#⚙️ Installation & Setup:-
      # Prerequisites:-
            - Java 17
            - Maven
            - Node.js
            - npm
            - MySQL-compatible Database



# 1. Clone Repository:-

git clone https://github.com/samarth8698/Bank-Management-System-Web.git

          cd Bank-Management-System-Web



# 2. Backend Setup:-

Navigate to the backend directory:

          cd Backend

Configure database credentials and application settings using environment variables.


Run the backend:-

      mvn spring-boot:run


Backend runs at:-

        http://localhost:8080



# 3. Frontend Setup:-
  Navigate to the frontend directory:-

        cd Frontend


Install dependencies:-
          npm install


Start development server:-
        npm run dev


Frontend runs at:-
        http://localhost:5173



# 4. Database Setup:-

- Create a MySQL-compatible database.
- Configure database connection details.
- Configure database credentials securely.
- Start the backend application.




# 🔒 Security:-

- JWT-based authentication
- BCrypt password hashing
- Role-based authorization
- Secured backend endpoints
- Environment-based configuration
- Protected database credentials
- 

* Never commit database passwords, JWT secrets, or private credentials to GitHub. *




# 🚀 Deployment:-

|  Service |   Platform |
|----------|------------|
| Frontend |    Vercel  |
| Backend  |   Render   |
| Database | TiDB Cloud |

The frontend communicates with the backend through REST APIs, while the backend manages banking operations and database interactions.



# 👨‍💻 Developer:-    *Samarth Subhash Adhao*
