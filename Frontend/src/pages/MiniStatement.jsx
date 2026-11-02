import { useEffect, useMemo, useState } from "react";
import {
  Landmark,
  Wallet,
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  CalendarDays,
  RefreshCw,
  AlertCircle,
  Download,
  Search,
  Filter,
  X,
  Eye,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import API from "../services/api";
import downloadStatement from "../utils/downloadStatement";

function MiniStatement() {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState(
    localStorage.getItem("selectedAccountId") || ""
  );

  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const account = accounts.find(
    (acc) => String(acc.id) === String(selectedAccountId)
  );

  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch All Accounts
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/accounts/my-accounts");
      const accountList = response.data || [];

      setAccounts(accountList);

      if (accountList.length === 0) {
        setError("No bank account found.");
        setAllTransactions([]);
        setSelectedAccountId("");
        return;
      }

      const savedAccountId = localStorage.getItem("selectedAccountId");

      const validAccount = accountList.find(
        (acc) => String(acc.id) === String(savedAccountId)
      );

      const accountId = validAccount
        ? String(validAccount.id)
        : String(accountList[0].id);

      setSelectedAccountId(accountId);
      localStorage.setItem("selectedAccountId", accountId);
    } catch (err) {
      console.error("Mini Statement Error:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to load bank accounts."
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch Selected Account Transactions
  const fetchMiniStatement = async (accountId) => {
    if (!accountId) return;

    try {
      setLoading(true);
      setError("");
      setAllTransactions([]);

      const response = await API.get(
        `/transactions/history/${accountId}`
      );

      setAllTransactions(response.data || []);
      setCurrentPage(1);
    } catch (err) {
      console.error("Mini Statement Error:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to load mini statement."
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial Accounts Fetch
  useEffect(() => {
    fetchAccounts();
  }, []);

  // Fetch Transactions Whenever Account Changes
  useEffect(() => {
    if (selectedAccountId) {
      fetchMiniStatement(selectedAccountId);
    }
  }, [selectedAccountId]);

  // Account Dropdown Change
  const handleAccountChange = (e) => {
    const accountId = e.target.value;

    setSelectedAccountId(accountId);
    localStorage.setItem("selectedAccountId", accountId);
  };

  // Format Date
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

  // Check Credit Transaction
  const isCredit = (type) => {
    return ["DEPOSIT", "TRANSFER_CREDIT"].includes(type);
  };

  // Transaction Labels
  const getTransactionLabel = (type) => {
    const labels = {
      DEPOSIT: "Deposit",
      WITHDRAWAL: "Withdrawal",
      TRANSFER_DEBIT: "Fund Transfer Sent",
      TRANSFER_CREDIT: "Fund Transfer Received",
    };

    return labels[type] || type;
  };

  // Search and Filter Logic
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((transaction) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        !search ||
        transaction.description?.toLowerCase().includes(search) ||
        transaction.referenceNumber?.toLowerCase().includes(search) ||
        getTransactionLabel(transaction.transactionType)
          .toLowerCase()
          .includes(search);

      const matchesType =
        selectedType === "ALL" ||
        transaction.transactionType === selectedType;

      const transactionDate = new Date(
        transaction.transactionDate
      );

      const startDate = fromDate
        ? new Date(`${fromDate}T00:00:00`)
        : null;

      const endDate = toDate
        ? new Date(`${toDate}T23:59:59.999`)
        : null;

      const matchesFromDate =
        !startDate || transactionDate >= startDate;

      const matchesToDate =
        !endDate || transactionDate <= endDate;

      const amount = Number(transaction.amount);

      const matchesMinAmount =
        minAmount === "" || amount >= Number(minAmount);

      const matchesMaxAmount =
        maxAmount === "" || amount <= Number(maxAmount);

      return (
        matchesSearch &&
        matchesType &&
        matchesFromDate &&
        matchesToDate &&
        matchesMinAmount &&
        matchesMaxAmount
      );
    });
  }, [
    allTransactions,
    searchTerm,
    selectedType,
    fromDate,
    toDate,
    minAmount,
    maxAmount,
  ]);

  // Pagination Logic
  const totalPages = Math.ceil(
    filteredTransactions.length / itemsPerPage
  );

  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Reset Page When Filters Change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    selectedType,
    fromDate,
    toDate,
    minAmount,
    maxAmount,
  ]);

  // Clear Filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedType("ALL");
    setFromDate("");
    setToDate("");
    setMinAmount("");
    setMaxAmount("");
    setCurrentPage(1);
  };

  // Download PDF
  const handleDownloadPDF = () => {
    if (!account || allTransactions.length === 0) return;

    try {
      setDownloading(true);
      downloadStatement(account, allTransactions);
    } catch (err) {
      console.error("PDF Download Error:", err);
      setError("Unable to download PDF statement.");
    } finally {
      setDownloading(false);
    }
  };

  // Loading Screen
  if (loading && accounts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-lg font-semibold text-blue-800">
          Loading Mini Statement...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Navbar */}
      <nav className="bg-blue-800 text-white px-8 py-5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Landmark size={30} />
          <h1 className="text-2xl font-bold">SecureBank</h1>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 bg-white text-blue-800 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100"
        >
          <ArrowLeft size={18} />
          Dashboard
        </button>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-6 md:p-10">
        {/* Page Heading */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">
              Mini Statement
            </h2>
            <p className="text-gray-500 mt-2">
              View and manage your banking transactions.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => fetchMiniStatement(selectedAccountId)}
              disabled={!selectedAccountId || loading}
              className="flex items-center justify-center gap-2 bg-blue-700 text-white px-5 py-3 rounded-lg hover:bg-blue-800 disabled:opacity-50"
            >
              <RefreshCw size={18} />
              Refresh
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={!account || allTransactions.length === 0 || downloading}
              className="flex items-center justify-center gap-2 bg-green-600 text-white px-5 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <Download size={18} />
              {downloading ? "Downloading..." : "Download PDF"}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Account Dropdown */}
        {!loading && accounts.length > 0 && (
          <div className="bg-white rounded-xl p-5 shadow-sm mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Select Bank Account
            </label>

            <select
              value={selectedAccountId}
              onChange={handleAccountChange}
              className="w-full md:w-96 border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.accountType} - {acc.accountNumber}
                </option>
              ))}
            </select>
          </div>
        )}

        {account && (
          <>
            {/* Account Balance */}
            <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white p-7 rounded-2xl shadow-lg mb-8">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-blue-100">Available Balance</p>
                  <h2 className="text-3xl font-bold mt-3">
                    ₹ {Number(account.balance || 0).toFixed(2)}
                  </h2>

                  <p className="text-blue-100 mt-4">
                    Account Number: {account.accountNumber}
                  </p>

                  <p className="text-blue-100 mt-1">
                    Account Type: {account.accountType}
                  </p>
                </div>

                <Wallet size={45} />
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 text-blue-700 p-3 rounded-xl">
                  <Filter size={23} />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-800">
                    Search & Filter Transactions
                  </h3>
                  <p className="text-sm text-gray-500">
                    Find transactions using different filters.
                  </p>
                </div>
              </div>

              {/* Search */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Search Transaction
                </label>

                <div className="relative">
                  <Search
                    size={20}
                    className="absolute left-3 top-3 text-gray-400"
                  />

                  <input
                    type="text"
                    placeholder="Search description or reference number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Transaction Type and Minimum Amount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Transaction Type
                  </label>

                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">All Transactions</option>
                    <option value="DEPOSIT">Deposit</option>
                    <option value="WITHDRAWAL">Withdrawal</option>
                    <option value="TRANSFER_DEBIT">Fund Transfer Sent</option>
                    <option value="TRANSFER_CREDIT">Fund Transfer Received</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Minimum Amount (₹)
                  </label>

                  <input
                    type="number"
                    min="0"
                    placeholder="Enter minimum amount"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Date Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    From Date
                  </label>

                  <input
                    type="date"
                    value={fromDate}
                    max={toDate || undefined}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    To Date
                  </label>

                  <input
                    type="date"
                    value={toDate}
                    min={fromDate || undefined}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Maximum Amount */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Maximum Amount (₹)
                </label>

                <input
                  type="number"
                  min="0"
                  placeholder="Enter maximum amount"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 bg-gray-200 text-gray-700 px-5 py-3 rounded-lg font-semibold hover:bg-gray-300"
              >
                <X size={18} />
                Clear Filters
              </button>

              <p className="text-sm text-blue-700 font-semibold mt-5">
                Showing {filteredTransactions.length} of{" "}
                {allTransactions.length} transactions
              </p>
            </div>

            {/* Transaction History */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-7">
                <div className="bg-blue-100 text-blue-700 p-3 rounded-xl">
                  <Receipt size={25} />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-800">
                    Transaction History
                  </h3>
                  <p className="text-sm text-gray-500">
                    Your filtered banking transactions.
                  </p>
                </div>
              </div>

              {loading ? (
                <p className="text-center py-10 text-blue-700 font-semibold">
                  Loading transactions...
                </p>
              ) : paginatedTransactions.length > 0 ? (
                <div className="space-y-4">
                  {paginatedTransactions.map((transaction) => {
                    const credit = isCredit(transaction.transactionType);

                    return (
                      <div
                        key={transaction.id}
                        className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition"
                      >
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                credit
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {credit ? (
                                <ArrowDownLeft size={25} />
                              ) : (
                                <ArrowUpRight size={25} />
                              )}
                            </div>

                            <div>
                              <h4 className="font-bold text-slate-800">
                                {getTransactionLabel(
                                  transaction.transactionType
                                )}
                              </h4>

                              <p className="text-sm text-gray-500 mt-1">
                                {transaction.description}
                              </p>
                            </div>
                          </div>

                          <div className="sm:text-right">
                            <p
                              className={`text-xl font-bold ${
                                credit
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {credit ? "+" : "-"} ₹
                              {Number(transaction.amount).toFixed(2)}
                            </p>

                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(transaction.transactionDate)}
                            </p>
                          </div>
                        </div>

                        <div className="border-t border-gray-100 mt-4 pt-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                            <CalendarDays size={14} />
                            <span>Reference Number:</span>
                            <span className="font-medium break-all">
                              {transaction.referenceNumber || "N/A"}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setSelectedTransaction(transaction)}
                            className="inline-flex items-center justify-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100 transition"
                          >
                            <Eye size={16} />
                            View Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Receipt
                    size={50}
                    className="mx-auto text-gray-300"
                  />

                  <h3 className="text-lg font-bold text-slate-700 mt-4">
                    No Transactions Found
                  </h3>

                  <p className="text-gray-500 mt-2">
                    Try changing or clearing your filters.
                  </p>
                </div>
              )}

              {/* Pagination */}
              {!loading && filteredTransactions.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 border-t pt-6">
                  <p className="text-sm text-gray-600">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(
                      startIndex + itemsPerPage,
                      filteredTransactions.length
                    )}{" "}
                    of {filteredTransactions.length} transactions
                  </p>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    <span className="font-semibold text-gray-700 whitespace-nowrap">
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(totalPages, prev + 1)
                        )
                      }
                      disabled={currentPage >= totalPages}
                      className="px-4 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedTransaction(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="transaction-details-title"
            className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between rounded-t-2xl bg-blue-800 px-6 py-5 text-white">
              <div>
                <h3 id="transaction-details-title" className="text-xl font-bold">
                  Transaction Details
                </h3>
                <p className="mt-1 text-sm text-blue-100">
                  Complete transaction information
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTransaction(null)}
                aria-label="Close transaction details"
                className="rounded-lg p-2 hover:bg-blue-700"
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div
                className={`rounded-xl p-4 ${
                  isCredit(selectedTransaction.transactionType)
                    ? "bg-green-50"
                    : "bg-red-50"
                }`}
              >
                <p className="text-sm text-gray-600">Transaction Amount</p>
                <p
                  className={`mt-1 text-3xl font-bold ${
                    isCredit(selectedTransaction.transactionType)
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  {isCredit(selectedTransaction.transactionType) ? "+" : "-"} ₹
                  {Number(selectedTransaction.amount || 0).toFixed(2)}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs font-medium text-gray-500">
                    Transaction ID
                  </p>
                  <p className="mt-1 break-all font-semibold text-slate-800">
                    {selectedTransaction.id ?? "N/A"}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs font-medium text-gray-500">
                    Transaction Type
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {getTransactionLabel(selectedTransaction.transactionType)}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-3 sm:col-span-2">
                  <p className="text-xs font-medium text-gray-500">
                    Date & Time
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {formatDate(selectedTransaction.transactionDate)}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-3 sm:col-span-2">
                  <p className="text-xs font-medium text-gray-500">
                    Reference Number
                  </p>
                  <p className="mt-1 break-all font-semibold text-slate-800">
                    {selectedTransaction.referenceNumber || "N/A"}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-3 sm:col-span-2">
                  <p className="text-xs font-medium text-gray-500">
                    Description
                  </p>
                  <p className="mt-1 break-words font-semibold text-slate-800">
                    {selectedTransaction.description || "N/A"}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-3 sm:col-span-2">
                  <p className="text-xs font-medium text-gray-500">
                    Transaction Status
                  </p>
                  <span className="mt-2 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1.5 text-sm font-bold text-green-700">
                    <span className="h-2 w-2 rounded-full bg-green-600" />
                    {(
                      selectedTransaction.status ||
                      selectedTransaction.transactionStatus ||
                      "SUCCESS"
                    )
                      .toString()
                      .toUpperCase()}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTransaction(null)}
                className="w-full rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MiniStatement;
