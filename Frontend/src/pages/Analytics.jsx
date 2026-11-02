import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  RefreshCw,
  TrendingUp,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Activity,
  CalendarDays,
  Download,
  Filter,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

import API from "../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const COLORS = ["#2563eb", "#16a34a", "#f97316", "#9333ea"];

const Analytics = () => {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [stats, setStats] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Date Range Filter States
  const [datePreset, setDatePreset] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Fetch Analytics Data
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const [dashboardResponse, transactionResponse, accountResponse] =
        await Promise.all([
          API.get("/admin/dashboard"),
          API.get("/admin/transactions"),
          API.get("/admin/accounts"),
        ]);

      setStats(dashboardResponse.data);

      setTransactions(
        Array.isArray(transactionResponse.data) ? transactionResponse.data : [],
      );

      setAccounts(
        Array.isArray(accountResponse.data) ? accountResponse.data : [],
      );
    } catch (err) {
      console.error("Analytics Error:", err);

      setError(err.response?.data?.message || "Unable to load analytics data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Format Date for Input
  const getLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // Preset Date Selection
  const handleDatePreset = (preset) => {
    setDatePreset(preset);

    const today = new Date();
    const end = getLocalDate(today);

    let start = "";

    if (preset === "TODAY") {
      start = end;
    } else if (preset === "7_DAYS") {
      const date = new Date();
      date.setDate(date.getDate() - 6);
      start = getLocalDate(date);
    } else if (preset === "30_DAYS") {
      const date = new Date();
      date.setDate(date.getDate() - 29);
      start = getLocalDate(date);
    } else if (preset === "THIS_MONTH") {
      const date = new Date(today.getFullYear(), today.getMonth(), 1);
      start = getLocalDate(date);
    } else if (preset === "ALL") {
      setFromDate("");
      setToDate("");
      return;
    }

    setFromDate(start);
    setToDate(end);
  };

  // Filter Transactions by Date
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      if (!transaction.transactionDate) return false;

      const transactionDate = new Date(transaction.transactionDate);

      if (Number.isNaN(transactionDate.getTime())) return false;

      const startDate = fromDate ? new Date(`${fromDate}T00:00:00`) : null;

      const endDate = toDate ? new Date(`${toDate}T23:59:59.999`) : null;

      return (
        (!startDate || transactionDate >= startDate) &&
        (!endDate || transactionDate <= endDate)
      );
    });
  }, [transactions, fromDate, toDate]);

  // Currency Formatter
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));
  };

  // Export filtered transactions as CSV
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      window.alert("No transactions available to export for the selected date range.");
      return;
    }

    const escapeCSV = (value) => {
      const text = String(value ?? "");
      return `"${text.replace(/"/g, '""')}"`;
    };

    const headers = [
      "Transaction ID",
      "Customer ID",
      "Account ID",
      "Transaction Type",
      "Amount (INR)",
      "Status",
      "Transaction Date",
    ];

    const rows = filteredTransactions.map((transaction) => [
      transaction.id,
      transaction.customerId,
      transaction.accountId,
      transaction.transactionType,
      Number(transaction.amount || 0).toFixed(2),
      transaction.status,
      transaction.transactionDate
        ? new Date(transaction.transactionDate).toLocaleString("en-IN")
        : "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    // UTF-8 BOM helps Excel display the CSV correctly.
    const blob = new Blob(["\uFEFF", csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const start = fromDate || "all-time";
    const end = toDate || "all-time";

    link.href = downloadUrl;
    link.download = `securebank-analytics-${start}-to-${end}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  };

  // Export filtered analytics report as PDF
  const handleExportPDF = () => {
    if (filteredTransactions.length === 0) {
      window.alert("No transactions available to export for the selected date range.");
      return;
    }

    const doc = new jsPDF();
    const reportDate = new Date().toLocaleString("en-IN");
    const dateRange = `${fromDate || "All Time"} to ${toDate || "All Time"}`;

    doc.setFontSize(18);
    doc.text("SecureBank - Analytics Report", 14, 18);
    doc.setFontSize(10);
    doc.text(`Date Range: ${dateRange}`, 14, 27);
    doc.text(`Generated: ${reportDate}`, 14, 33);

    autoTable(doc, {
      startY: 40,
      head: [["Metric", "Value"]],
      body: [
        ["Total Transactions", String(filteredTransactions.length)],
        ["Successful Transactions", String(successfulTransactions)],
        ["Total Deposits", `INR ${depositWithdrawalData[0].amount.toFixed(2)}`],
        ["Total Withdrawals", `INR ${depositWithdrawalData[1].amount.toFixed(2)}`],
        ["Total Bank Balance", `INR ${Number(stats?.totalBalance || 0).toFixed(2)}`],
      ],
      theme: "grid",
      headStyles: { fillColor: [37, 99, 235] },
    });

    const transactionRows = filteredTransactions.map((transaction) => [
      transaction.id ?? "",
      transaction.customerId ?? "",
      transaction.accountId ?? "",
      transaction.transactionType ?? "",
      Number(transaction.amount || 0).toFixed(2),
      transaction.status ?? "",
      transaction.transactionDate
        ? new Date(transaction.transactionDate).toLocaleString("en-IN")
        : "",
    ]);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [[
        "Transaction ID",
        "Customer ID",
        "Account ID",
        "Type",
        "Amount (INR)",
        "Status",
        "Date & Time",
      ]],
      body: transactionRows,
      theme: "striped",
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 7, cellPadding: 2 },
      margin: { left: 10, right: 10 },
    });

    doc.save(`securebank-analytics-${fromDate || "all-time"}-to-${toDate || "all-time"}.pdf`);
  };

  // Transaction Type Distribution
  const transactionTypes = ["DEPOSIT", "WITHDRAWAL", "TRANSFER"];

  const transactionDistribution = transactionTypes.map((type) => ({
    name: type,
    value: filteredTransactions.filter(
      (transaction) => transaction.transactionType?.toUpperCase() === type,
    ).length,
  }));

  // Account Status Distribution
  const accountDistribution = ["ACTIVE", "FROZEN"].map((status) => ({
    name: status,
    value: accounts.filter(
      (account) => account.status?.toUpperCase() === status,
    ).length,
  }));

  // Deposit vs Withdrawal
  const depositWithdrawalData = [
    {
      name: "Deposits",
      amount: filteredTransactions
        .filter((t) => t.transactionType?.toUpperCase() === "DEPOSIT")
        .reduce((sum, t) => sum + Number(t.amount || 0), 0),
    },
    {
      name: "Withdrawals",
      amount: filteredTransactions
        .filter((t) => t.transactionType?.toUpperCase() === "WITHDRAWAL")
        .reduce((sum, t) => sum + Number(t.amount || 0), 0),
    },
  ];

  // Monthly Transaction Trends
  const monthlyData = (() => {
    const months = [];

    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

      months.push({
        key: `${date.getFullYear()}-${date.getMonth()}`,
        month: date.toLocaleString("en-IN", {
          month: "short",
          year: "2-digit",
        }),
        deposits: 0,
        withdrawals: 0,
        transfers: 0,
      });
    }

    filteredTransactions.forEach((transaction) => {
      if (!transaction.transactionDate) return;

      const transactionDate = new Date(transaction.transactionDate);

      if (Number.isNaN(transactionDate.getTime())) return;

      const key = `${transactionDate.getFullYear()}-${transactionDate.getMonth()}`;

      const month = months.find((item) => item.key === key);

      if (!month) return;

      const type = transaction.transactionType?.toUpperCase();
      const amount = Number(transaction.amount || 0);

      if (type === "DEPOSIT") {
        month.deposits += amount;
      } else if (type === "WITHDRAWAL") {
        month.withdrawals += amount;
      } else if (type === "TRANSFER") {
        month.transfers += amount;
      }
    });

    return months;
  })();

  // Statistics
  const successfulTransactions = filteredTransactions.filter(
    (transaction) => transaction.status?.toUpperCase() === "SUCCESS",
  ).length;

  const activeAccounts = accounts.filter(
    (account) => account.status?.toUpperCase() === "ACTIVE",
  ).length;

  const frozenAccounts = accounts.filter(
    (account) => account.status?.toUpperCase() === "FROZEN",
  ).length;

  const cards = [
    {
      title: "Total Deposits",
      value: formatCurrency(depositWithdrawalData[0].amount),
      icon: ArrowDownCircle,
      bg: "bg-green-50",
      color: "text-green-600",
    },
    {
      title: "Total Withdrawals",
      value: formatCurrency(depositWithdrawalData[1].amount),
      icon: ArrowUpCircle,
      bg: "bg-orange-50",
      color: "text-orange-600",
    },
    {
      title: "Total Transactions",
      value: filteredTransactions.length,
      icon: Activity,
      bg: "bg-blue-50",
      color: "text-blue-600",
    },
    {
      title: "Total Bank Balance",
      value: formatCurrency(stats?.totalBalance),
      icon: Wallet,
      bg: "bg-purple-50",
      color: "text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-700 p-3 rounded-xl">
              <TrendingUp className="text-white" size={24} />
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Bank Analytics
              </h1>

              <p className="text-xs text-slate-500">
                SecureBank Administration
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/admin/dashboard")}
            className="flex items-center gap-2 text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg"
          >
            <ArrowLeft size={18} />
            Dashboard
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Heading */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Analytics Dashboard
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Analyze financial activities and bank performance.
            </p>
          </div>

          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-blue-700 text-white px-5 py-3 rounded-xl hover:bg-blue-800 disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Refresh Analytics
          </button>
        </div>

        {/* Date Range Filter */}

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-8">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="text-blue-700" size={22} />
            <h3 className="text-lg font-bold text-slate-900">
              Filter Analytics by Date
            </h3>
          </div>

          <div className="flex flex-wrap gap-2 mb-5">
            {[
              { label: "All Time", value: "ALL" },
              { label: "Today", value: "TODAY" },
              { label: "Last 7 Days", value: "7_DAYS" },
              { label: "Last 30 Days", value: "30_DAYS" },
              { label: "This Month", value: "THIS_MONTH" },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => handleDatePreset(item.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  datePreset === item.value
                    ? "bg-blue-700 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-blue-50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                From Date
              </label>

              <input
                type="date"
                value={fromDate}
                max={toDate || undefined}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setDatePreset("CUSTOM");
                }}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                To Date
              </label>

              <input
                type="date"
                value={toDate}
                min={fromDate || undefined}
                max={getLocalDate(new Date())}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setDatePreset("CUSTOM");
                }}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mt-4">
            <p className="text-sm text-slate-500">
              Showing {filteredTransactions.length} transactions
            </p>

            <div className="flex items-center gap-4">
              <button
                onClick={handleExportCSV}
                disabled={loading || filteredTransactions.length === 0}
                className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={16} />
                Export CSV
              </button>

              <button
                onClick={handleExportPDF}
                disabled={loading || filteredTransactions.length === 0}
                className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={16} />
                Export PDF
              </button>

              <button
                onClick={() => handleDatePreset("ALL")}
                className="text-sm text-red-600 font-medium hover:underline"
              >
                Clear Filter
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-24">
            <RefreshCw className="animate-spin text-blue-700" size={36} />
          </div>
        ) : stats ? (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {cards.map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.title}
                    className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-between mb-5">
                      <div className={`p-3 rounded-xl ${card.bg}`}>
                        <Icon className={card.color} size={25} />
                      </div>
                    </div>

                    <p className="text-sm text-slate-500">{card.title}</p>

                    <h3 className="text-xl font-bold text-slate-900 mt-2">
                      {card.value}
                    </h3>
                  </div>
                );
              })}
            </div>

            {/* Deposit vs Withdrawal Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900">
                  Deposit vs Withdrawal
                </h3>

                <p className="text-sm text-slate-500 mt-1 mb-6">
                  Overall deposit and withdrawal amounts.
                </p>

                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={depositWithdrawalData}>
                      <CartesianGrid strokeDasharray="3 3" />

                      <XAxis dataKey="name" />

                      <YAxis />

                      <Tooltip formatter={(value) => formatCurrency(value)} />

                      <Legend />

                      <Bar
                        dataKey="amount"
                        name="Amount"
                        fill="#2563eb"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Transaction Distribution */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900">
                  Transaction Distribution
                </h3>

                <p className="text-sm text-slate-500 mt-1 mb-6">
                  Distribution by transaction type.
                </p>

                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={transactionDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {transactionDistribution.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>

                      <Tooltip />

                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Monthly Trends and Account Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Monthly Trends */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900">
                  Monthly Transaction Trends
                </h3>

                <p className="text-sm text-slate-500 mt-1 mb-6">
                  Monthly deposit, withdrawal and transfer amounts.
                </p>

                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />

                      <XAxis dataKey="month" />

                      <YAxis />

                      <Tooltip formatter={(value) => formatCurrency(value)} />

                      <Legend />

                      <Line
                        type="monotone"
                        dataKey="deposits"
                        name="Deposits"
                        stroke="#16a34a"
                        strokeWidth={3}
                      />

                      <Line
                        type="monotone"
                        dataKey="withdrawals"
                        name="Withdrawals"
                        stroke="#f97316"
                        strokeWidth={3}
                      />

                      <Line
                        type="monotone"
                        dataKey="transfers"
                        name="Transfers"
                        stroke="#2563eb"
                        strokeWidth={3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Account Status */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900">
                  Account Status Distribution
                </h3>

                <p className="text-sm text-slate-500 mt-1 mb-6">
                  Active and frozen bank accounts.
                </p>

                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={accountDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {accountDistribution.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={
                              entry.name === "ACTIVE" ? "#16a34a" : "#ef4444"
                            }
                          />
                        ))}
                      </Pie>

                      <Tooltip />

                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-green-50 rounded-xl p-4">
                    <p className="text-sm text-green-700">Active Accounts</p>

                    <h3 className="text-2xl font-bold text-green-700">
                      {activeAccounts}
                    </h3>
                  </div>

                  <div className="bg-red-50 rounded-xl p-4">
                    <p className="text-sm text-red-700">Frozen Accounts</p>

                    <h3 className="text-2xl font-bold text-red-700">
                      {frozenAccounts}
                    </h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-5">
                Analytics Summary
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-slate-50 rounded-xl p-5">
                  <p className="text-sm text-slate-500">
                    Successful Transactions
                  </p>

                  <h3 className="text-2xl font-bold text-green-600 mt-2">
                    {successfulTransactions}
                  </h3>
                </div>

                <div className="bg-slate-50 rounded-xl p-5">
                  <p className="text-sm text-slate-500">Total Bank Accounts</p>

                  <h3 className="text-2xl font-bold text-blue-600 mt-2">
                    {accounts.length}
                  </h3>
                </div>

                <div className="bg-slate-50 rounded-xl p-5">
                  <p className="text-sm text-slate-500">Total Customers</p>

                  <h3 className="text-2xl font-bold text-purple-600 mt-2">
                    {stats.totalCustomers}
                  </h3>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-20 text-slate-500">
            Analytics data is unavailable.
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} SecureBank. All rights reserved.
          </p>

          <p className="text-sm text-slate-400">Analytics Dashboard</p>
        </div>
      </footer>
    </div>
  );
};

export default Analytics;
