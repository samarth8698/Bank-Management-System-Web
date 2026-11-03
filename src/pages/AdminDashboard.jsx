import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Landmark,
  Users,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowLeftRight,
  LogOut,
  RefreshCw,
  LayoutDashboard,
  ShieldCheck,
  Settings,
  Activity,
  TrendingUp,
  ChevronRight,
  AlertTriangle,
  ClipboardList,
} from "lucide-react";

import API from "../services/api";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ================= FETCH DASHBOARD =================

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/admin/dashboard");

      setStats(response.data);
    } catch (err) {
      console.error("Admin Dashboard Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load dashboard statistics."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // ================= LOGOUT =================

  const handleLogout = () => {
    localStorage.clear();

    window.location.replace("/login");
  };

  // ================= CURRENCY FORMATTER =================

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));
  };

  // ================= STATISTICS CARDS =================

  const cards = [
    {
      title: "Total Customers",
      value: stats?.totalCustomers ?? 0,
      icon: Users,
      color: "from-blue-500 to-blue-700",
      bg: "bg-blue-50",
      text: "text-blue-600",
      path: "/admin/customers",
    },
    {
      title: "Total Accounts",
      value: stats?.totalAccounts ?? 0,
      icon: Wallet,
      color: "from-purple-500 to-purple-700",
      bg: "bg-purple-50",
      text: "text-purple-600",
      path: "/admin/accounts",
    },
    {
      title: "Total Balance",
      value: formatCurrency(stats?.totalBalance),
      icon: Landmark,
      color: "from-emerald-500 to-emerald-700",
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      path: "/admin/accounts",
    },
    {
      title: "Total Deposits",
      value: formatCurrency(stats?.totalDeposits),
      icon: ArrowDownCircle,
      color: "from-green-500 to-green-700",
      bg: "bg-green-50",
      text: "text-green-600",
      path: "/admin/transactions",
    },
    {
      title: "Total Withdrawals",
      value: formatCurrency(stats?.totalWithdrawals),
      icon: ArrowUpCircle,
      color: "from-orange-500 to-orange-700",
      bg: "bg-orange-50",
      text: "text-orange-600",
      path: "/admin/transactions",
    },
    {
      title: "Total Transactions",
      value: stats?.totalTransactions ?? 0,
      icon: ArrowLeftRight,
      color: "from-indigo-500 to-indigo-700",
      bg: "bg-indigo-50",
      text: "text-indigo-600",
      path: "/admin/transactions",
    },
  ];

  // ================= MANAGEMENT CARDS =================

  const managementCards = [
    {
      title: "Customer Management",
      description: "View and manage registered bank customers.",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      path: "/admin/customers",
      action: "View Customers",
    },
    {
      title: "Account Management",
      description: "Monitor accounts and control account status.",
      icon: Wallet,
      color: "text-purple-600",
      bg: "bg-purple-50",
      path: "/admin/accounts",
      action: "Manage Accounts",
    },
    {
      title: "Transaction Monitoring",
      description: "Review deposits, withdrawals and transfers.",
      icon: ArrowLeftRight,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      path: "/admin/transactions",
      action: "View Transactions",
    },
    {
      title: "Analytics Dashboard",
      description: "Analyze financial activities and bank performance.",
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      path: "/admin/analytics",
      action: "View Analytics",
    },
    {
      title: "Account Opening Requests",
      description:
        "Review new account applications and approve or reject customer requests.",
      icon: ClipboardList,
      color: "text-cyan-600",
      bg: "bg-cyan-50",
      path: "/admin/account-opening",
      action: "Manage Requests",
    },
    {
      title: "Failed Transactions",
      description:
        "Monitor unsuccessful transactions and investigate failure reasons.",
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50",
      path: "/admin/failed-transactions",
      action: "View Failed Transactions",
    },
  ];

  // ================= UI =================

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}

      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="bg-blue-700 p-3 rounded-xl">
              <Landmark className="w-6 h-6 text-white" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-900">
                SecureBank
              </h1>

              <p className="text-xs text-slate-500">
                Administration Panel
              </p>
            </div>
          </div>

          {/* ADMIN ACTIONS */}

          <div className="flex items-center gap-4">
            <span className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-600">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              Administrator
            </span>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* DASHBOARD HEADING */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <LayoutDashboard className="text-blue-700" />

              <h2 className="text-3xl font-bold text-slate-900">
                Admin Dashboard
              </h2>
            </div>

            <p className="text-slate-500">
              Monitor and manage SecureBank operations.
            </p>
          </div>

          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-blue-700 text-white px-5 py-3 rounded-xl hover:bg-blue-800 transition disabled:opacity-50"
          >
            <RefreshCw
              size={18}
              className={loading ? "animate-spin" : ""}
            />
            Refresh Data
          </button>
        </div>

        {/* ERROR MESSAGE */}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
            {error}

            <button
              onClick={fetchDashboard}
              className="ml-3 underline font-semibold"
            >
              Try Again
            </button>
          </div>
        )}

        {/* LOADING */}

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <RefreshCw
              className="animate-spin text-blue-700"
              size={36}
            />
          </div>
        ) : stats ? (
          <>
            {/* STATISTICS */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((card) => {
                const Icon = card.icon;

                return (
                  <button
                    key={card.title}
                    type="button"
                    onClick={() => navigate(card.path)}
                    className="text-left w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-lg hover:border-blue-300 transition duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className={`p-4 rounded-xl ${card.bg}`}>
                        <Icon size={26} className={card.text} />
                      </div>

                      <div
                        className={`w-12 h-1.5 rounded-full bg-gradient-to-r ${card.color}`}
                      />
                    </div>

                    <p className="text-sm font-medium text-slate-500 mb-2">
                      {card.title}
                    </p>

                    <h3 className="text-2xl font-bold text-slate-900 break-words">
                      {card.value}
                    </h3>
                  </button>
                );
              })}
            </div>

            {/* MANAGEMENT SECTION */}

            <div className="mt-10">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Bank Management
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    Manage customers, accounts, transactions and analytics.
                  </p>
                </div>

                <Settings className="text-slate-400" size={22} />
              </div>

              {/* MANAGEMENT CARDS */}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {managementCards.map((card) => {
                  const Icon = card.icon;

                  return (
                    <button
                      key={card.title}
                      onClick={() => navigate(card.path)}
                      className="text-left bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg hover:border-blue-300 transition duration-300 group"
                    >
                      <div className="flex items-center justify-between mb-5">
                        <div className={`p-3 rounded-xl ${card.bg}`}>
                          <Icon className={card.color} size={28} />
                        </div>

                        <ChevronRight
                          className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition"
                          size={22}
                        />
                      </div>

                      <h4 className="text-lg font-semibold text-slate-900">
                        {card.title}
                      </h4>

                      <p className="text-sm text-slate-500 mt-2">
                        {card.description}
                      </p>

                      <span className="inline-flex items-center gap-2 mt-5 text-sm font-semibold text-blue-700">
                        {card.action}
                        <ArrowLeftRight size={15} />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SYSTEM INFORMATION */}

            <div className="mt-10 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="bg-green-50 p-3 rounded-xl">
                  <Activity className="text-green-600" size={24} />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    System Overview
                  </h3>

                  <p className="text-sm text-slate-500">
                    SecureBank administration overview.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <ShieldCheck className="text-green-600" size={24} />

                  <div>
                    <p className="text-sm text-slate-500">
                      Admin Authentication
                    </p>

                    <p className="font-semibold text-green-700">
                      Active
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <TrendingUp className="text-blue-600" size={24} />

                  <div>
                    <p className="text-sm text-slate-500">
                      Dashboard Statistics
                    </p>

                    <p className="font-semibold text-blue-700">
                      Live Data
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-20 text-slate-500">
            Dashboard data is unavailable.
          </div>
        )}
      </main>

      {/* FOOTER */}

      <footer className="border-t border-slate-200 bg-white mt-10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} SecureBank. All rights reserved.
          </p>

          <p className="text-sm text-slate-400">
            SecureBank Administration Panel
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;
