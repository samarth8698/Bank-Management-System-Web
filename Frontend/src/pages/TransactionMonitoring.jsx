import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ArrowLeftRight,
  Search,
  RefreshCw,
  Eye,
  X,
  Calendar,
  Wallet,
  User,
  IndianRupee,
  Receipt,
  CheckCircle,
} from "lucide-react";

import API from "../services/api";

const TransactionMonitoring = () => {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Fetch All Transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/admin/transactions");

      setTransactions(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      console.error("Transaction Fetch Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load transactions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Search and Filter
  const filteredTransactions = transactions.filter((transaction) => {
    const account = transaction.account || {};
    const customer = account.customer || {};

    const customerName =
      `${customer.firstName || ""} ${customer.lastName || ""}`.toLowerCase();

    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      String(transaction.id).includes(searchText) ||
      String(transaction.referenceNumber || "")
        .toLowerCase()
        .includes(searchText) ||
      String(account.accountNumber || "")
        .toLowerCase()
        .includes(searchText) ||
      customerName.includes(searchText) ||
      String(transaction.transactionType || "")
        .toLowerCase()
        .includes(searchText);

    const matchesType =
      typeFilter === "ALL" ||
      transaction.transactionType?.toUpperCase() === typeFilter;

    const matchesStatus =
      statusFilter === "ALL" ||
      transaction.status?.toUpperCase() === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Currency Formatter
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));
  };

  // Date Formatter
  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Transaction Statistics
  const totalTransactions = transactions.length;

  const successfulTransactions = transactions.filter(
    (transaction) =>
      transaction.status?.toUpperCase() === "SUCCESS"
  ).length;

  const failedTransactions = transactions.filter(
    (transaction) =>
      transaction.status?.toUpperCase() === "FAILED"
  ).length;

  const totalTransactionAmount = transactions.reduce(
    (total, transaction) =>
      total + Number(transaction.amount || 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">

        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="bg-indigo-700 p-3 rounded-xl">
              <ArrowLeftRight className="text-white" size={24} />
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Transaction Monitoring
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">

          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              All Transactions
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Monitor and review all bank transactions.
            </p>
          </div>

          <button
            onClick={fetchTransactions}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-blue-700 text-white px-5 py-3 rounded-xl hover:bg-blue-800 disabled:opacity-50"
          >
            <RefreshCw
              size={18}
              className={loading ? "animate-spin" : ""}
            />

            Refresh
          </button>

        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-7">

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-4">

              <div className="bg-blue-50 p-3 rounded-xl">
                <Receipt className="text-blue-600" size={25} />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Total Transactions
                </p>

                <h3 className="text-2xl font-bold text-slate-900">
                  {totalTransactions}
                </h3>
              </div>

            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-4">

              <div className="bg-green-50 p-3 rounded-xl">
                <CheckCircle className="text-green-600" size={25} />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Successful
                </p>

                <h3 className="text-2xl font-bold text-green-600">
                  {successfulTransactions}
                </h3>
              </div>

            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-4">

              <div className="bg-red-50 p-3 rounded-xl">
                <X className="text-red-600" size={25} />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Failed
                </p>

                <h3 className="text-2xl font-bold text-red-600">
                  {failedTransactions}
                </h3>
              </div>

            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-4">

              <div className="bg-purple-50 p-3 rounded-xl">
                <IndianRupee className="text-purple-600" size={25} />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Total Transaction Amount
                </p>

                <h3 className="text-xl font-bold text-slate-900">
                  {formatCurrency(totalTransactionAmount)}
                </h3>
              </div>

            </div>
          </div>

        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 shadow-sm">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Search */}
            <div className="relative">

              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />

              <input
                type="text"
                placeholder="Search transaction, account or customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Transaction Types</option>
              <option value="DEPOSIT">Deposit</option>
              <option value="WITHDRAWAL">Withdrawal</option>
              <option value="TRANSFER">Transfer</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Status</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
            </select>

          </div>

        </div>

        {/* Transactions Table */}
        {loading ? (

          <div className="flex justify-center py-20">
            <RefreshCw
              className="animate-spin text-blue-700"
              size={36}
            />
          </div>

        ) : (

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead className="bg-slate-100 text-slate-600 text-sm">

                  <tr>
                    <th className="px-6 py-4">Transaction ID</th>
                    <th className="px-6 py-4">Account Number</th>
                    <th className="px-6 py-4">Transaction Type</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Action</th>
                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredTransactions.length > 0 ? (

                    filteredTransactions.map((transaction) => {

                      const account = transaction.account || {};

                      const isSuccess =
                        transaction.status?.toUpperCase() === "SUCCESS";

                      const transactionType =
                        transaction.transactionType?.toUpperCase();

                      return (

                        <tr
                          key={transaction.id}
                          className="hover:bg-slate-50 transition"
                        >

                          <td className="px-6 py-4 font-semibold text-slate-800">
                            #{transaction.id}
                          </td>

                          <td className="px-6 py-4 font-medium text-slate-700">
                            {account.accountNumber || "N/A"}
                          </td>

                          <td className="px-6 py-4">

                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              transactionType === "DEPOSIT"
                                ? "bg-green-50 text-green-700"
                                : transactionType === "WITHDRAWAL"
                                ? "bg-orange-50 text-orange-700"
                                : "bg-blue-50 text-blue-700"
                            }`}>
                              {transaction.transactionType || "N/A"}
                            </span>

                          </td>

                          <td className="px-6 py-4 font-semibold text-slate-900">
                            {formatCurrency(transaction.amount)}
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-600">
                            {formatDate(transaction.transactionDate)}
                          </td>

                          <td className="px-6 py-4">

                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              isSuccess
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                            }`}>
                              {transaction.status || "N/A"}
                            </span>

                          </td>

                          <td className="px-6 py-4 text-center">

                            <button
                              onClick={() =>
                                setSelectedTransaction(transaction)
                              }
                              className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-100"
                            >
                              <Eye size={16} />
                              View
                            </button>

                          </td>

                        </tr>

                      );

                    })

                  ) : (

                    <tr>
                      <td
                        colSpan="7"
                        className="text-center py-12 text-slate-500"
                      >
                        No transactions found.
                      </td>
                    </tr>

                  )}

                </tbody>

              </table>

            </div>

            <div className="px-6 py-4 border-t border-slate-100 text-sm text-slate-500">
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </div>

          </div>

        )}

      </main>

      {/* Transaction Details Modal */}
      {selectedTransaction && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">

            <div className="bg-indigo-700 text-white px-6 py-5 flex items-center justify-between">

              <div>
                <h3 className="text-xl font-bold">
                  Transaction Details
                </h3>

                <p className="text-sm text-indigo-100">
                  Transaction ID: #{selectedTransaction.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedTransaction(null)}
                className="hover:bg-indigo-600 p-2 rounded-lg"
              >
                <X size={22} />
              </button>

            </div>

            <div className="p-6 space-y-5">

              <div className="flex items-center gap-3">

                <Receipt className="text-indigo-600" size={22} />

                <div>
                  <p className="text-sm text-slate-500">
                    Reference Number
                  </p>

                  <p className="font-semibold text-slate-900 break-all">
                    {selectedTransaction.referenceNumber || "N/A"}
                  </p>
                </div>

              </div>

              <div className="flex items-center gap-3">

                <Wallet className="text-blue-600" size={22} />

                <div>
                  <p className="text-sm text-slate-500">
                    Account Number
                  </p>

                  <p className="font-semibold text-slate-900">
                    {selectedTransaction.account?.accountNumber || "N/A"}
                  </p>
                </div>

              </div>

              <div className="flex items-center gap-3">

                <User className="text-blue-600" size={22} />

                <div>
                  <p className="text-sm text-slate-500">
                    Customer Name
                  </p>

                  <p className="font-semibold text-slate-900">
                    {selectedTransaction.account?.customer?.firstName || ""}
                    {" "}
                    {selectedTransaction.account?.customer?.lastName || ""}
                  </p>
                </div>

              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Transaction Type
                </p>

                <p className="font-semibold text-slate-900">
                  {selectedTransaction.transactionType}
                </p>
              </div>

              <div className="flex items-center gap-3">

                <IndianRupee className="text-green-600" size={22} />

                <div>
                  <p className="text-sm text-slate-500">
                    Transaction Amount
                  </p>

                  <p className="text-xl font-bold text-slate-900">
                    {formatCurrency(selectedTransaction.amount)}
                  </p>
                </div>

              </div>

              <div className="flex items-center gap-3">

                <Calendar className="text-blue-600" size={22} />

                <div>
                  <p className="text-sm text-slate-500">
                    Transaction Date
                  </p>

                  <p className="font-medium text-slate-900">
                    {formatDate(selectedTransaction.transactionDate)}
                  </p>
                </div>

              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Description
                </p>

                <p className="font-medium text-slate-900">
                  {selectedTransaction.description || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Transaction Status
                </p>

                <span className="inline-block mt-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {selectedTransaction.status || "N/A"}
                </span>
              </div>

            </div>

            <div className="px-6 pb-6">

              <button
                onClick={() => setSelectedTransaction(null)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-medium"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default TransactionMonitoring;