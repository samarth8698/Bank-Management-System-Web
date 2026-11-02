import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Deposit from "./pages/Deposit";
import Withdraw from "./pages/Withdraw";
import TransactionHistory from "./pages/TransactionHistory";
import FastCash from "./pages/FastCash";
import ChangePin from "./pages/ChangePin";
import MyProfile from "./pages/MyProfile";
import FundTransfer from "./pages/FundTransfer";
import MiniStatement from "./pages/MiniStatement";
import ForgotPassword from "./pages/ForgotPassword";

import AdminDashboard from "./pages/AdminDashboard";
import CustomerManagement from "./pages/CustomerManagement";
import AccountManagement from "./pages/AccountManagement";
import TransactionMonitoring from "./pages/TransactionMonitoring";
import Analytics from "./pages/Analytics";
import FailedTransactions from "./pages/FailedTransactions";
import AccountOpening from "./pages/AccountOpening";
import AdminAccountOpening from "./pages/AdminAccountOpening";

// Customer Protected Route
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  return token ? children : <Navigate to="/login" replace />;
}

// Admin Protected Route
function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// Browser Back/Forward Cache Handler
function BackForwardCacheHandler() {
  useEffect(() => {
    const handlePageShow = (event) => {
      if (event.persisted) {
        window.location.reload();
      }
    };

    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <BackForwardCacheHandler />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Customer Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/account-opening"
          element={
            <ProtectedRoute>
              <AccountOpening />
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* Admin Analytics */}
        <Route
          path="/admin/analytics"
          element={
            <AdminRoute>
              <Analytics />
            </AdminRoute>
          }
        />

        {/* Admin Failed Transactions */}
        <Route
          path="/admin/failed-transactions"
          element={
            <AdminRoute>
              <FailedTransactions />
            </AdminRoute>
          }
        />

        {/* Admin Customer Management */}
        <Route
          path="/admin/customers"
          element={
            <AdminRoute>
              <CustomerManagement />
            </AdminRoute>
          }
        />

        {/* Admin Account Management */}
        <Route
          path="/admin/accounts"
          element={
            <AdminRoute>
              <AccountManagement />
            </AdminRoute>
          }
        />

        {/* Admin Transaction Monitoring */}
        <Route
          path="/admin/transactions"
          element={
            <AdminRoute>
              <TransactionMonitoring />
            </AdminRoute>
          }
        />

        {/* Admin Account Opening */}
        <Route
          path="/admin/account-opening"
          element={
            <AdminRoute>
              <AdminAccountOpening />
            </AdminRoute>
          }
        />

        {/* Deposit */}
        <Route
          path="/deposit"
          element={
            <ProtectedRoute>
              <Deposit />
            </ProtectedRoute>
          }
        />

        {/* Withdraw */}
        <Route
          path="/withdraw"
          element={
            <ProtectedRoute>
              <Withdraw />
            </ProtectedRoute>
          }
        />

        {/* Transaction History */}
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <TransactionHistory />
            </ProtectedRoute>
          }
        />

        {/* Fast Cash */}
        <Route
          path="/fast-cash"
          element={
            <ProtectedRoute>
              <FastCash />
            </ProtectedRoute>
          }
        />

        {/* Change PIN */}
        <Route
          path="/change-pin"
          element={
            <ProtectedRoute>
              <ChangePin />
            </ProtectedRoute>
          }
        />

        {/* Fund Transfer */}
        <Route
          path="/fund-transfer"
          element={
            <ProtectedRoute>
              <FundTransfer />
            </ProtectedRoute>
          }
        />

        {/* Mini Statement */}
        <Route
          path="/mini-statement"
          element={
            <ProtectedRoute>
              <MiniStatement />
            </ProtectedRoute>
          }
        />

        {/* My Profile */}
        <Route
          path="/my-profile"
          element={
            <ProtectedRoute>
              <MyProfile />
            </ProtectedRoute>
          }
        />

        {/* Invalid Route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
