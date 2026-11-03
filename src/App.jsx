import { useEffect } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

// Authentication
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

// Customer Pages
import Dashboard from "./pages/Dashboard";
import Deposit from "./pages/Deposit";
import Withdraw from "./pages/Withdraw";
import TransactionHistory from "./pages/TransactionHistory";
import FastCash from "./pages/FastCash";
import ChangePin from "./pages/ChangePin";
import MyProfile from "./pages/MyProfile";
import FundTransfer from "./pages/FundTransfer";
import MiniStatement from "./pages/MiniStatement";
import AccountOpening from "./pages/AccountOpening";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import CustomerManagement from "./pages/CustomerManagement";
import AccountManagement from "./pages/AccountManagement";
import TransactionMonitoring from "./pages/TransactionMonitoring";
import Analytics from "./pages/Analytics";
import FailedTransactions from "./pages/FailedTransactions";
import AdminAccountOpening from "./pages/AdminAccountOpening";

// ===============================
// NAVIGATION HANDLER
// ===============================

function NavigationHandler() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return null;
}

// ===============================
// CUSTOMER PROTECTED ROUTE
// ===============================

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role === "ADMIN") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (role !== "CUSTOMER") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// ===============================
// ADMIN PROTECTED ROUTE
// ===============================

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

// ===============================
// APP
// ===============================

function App() {
  return (
    <BrowserRouter>
      <NavigationHandler />

      <Routes>
        {/* ROOT */}

        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* AUTHENTICATION */}

        {/* Login Route - PublicRoute Removed */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        {/* CUSTOMER */}

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

        <Route
          path="/deposit"
          element={
            <ProtectedRoute>
              <Deposit />
            </ProtectedRoute>
          }
        />

        <Route
          path="/withdraw"
          element={
            <ProtectedRoute>
              <Withdraw />
            </ProtectedRoute>
          }
        />

        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <TransactionHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/fast-cash"
          element={
            <ProtectedRoute>
              <FastCash />
            </ProtectedRoute>
          }
        />

        <Route
          path="/change-pin"
          element={
            <ProtectedRoute>
              <ChangePin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/fund-transfer"
          element={
            <ProtectedRoute>
              <FundTransfer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mini-statement"
          element={
            <ProtectedRoute>
              <MiniStatement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-profile"
          element={
            <ProtectedRoute>
              <MyProfile />
            </ProtectedRoute>
          }
        />

        {/* ADMIN */}

        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/analytics"
          element={
            <AdminRoute>
              <Analytics />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/failed-transactions"
          element={
            <AdminRoute>
              <FailedTransactions />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/customers"
          element={
            <AdminRoute>
              <CustomerManagement />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/accounts"
          element={
            <AdminRoute>
              <AccountManagement />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/transactions"
          element={
            <AdminRoute>
              <TransactionMonitoring />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/account-opening"
          element={
            <AdminRoute>
              <AdminAccountOpening />
            </AdminRoute>
          }
        />

        {/* INVALID ROUTE */}

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
