import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Wallet,
  Search,
  RefreshCw,
  ArrowLeft,
  Eye,
  Lock,
  Unlock,
  X,
  User,
  Calendar,
  IndianRupee,
  ShieldCheck,
} from "lucide-react";

import API from "../services/api";

const AccountManagement = () => {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const [selectedAccount, setSelectedAccount] = useState(null);

  // Fetch All Accounts
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/admin/accounts");

      setAccounts(response.data);
    } catch (err) {
      console.error("Account Fetch Error:", err);

      setError(err.response?.data?.message || "Unable to load bank accounts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Search and Filter
  const filteredAccounts = accounts.filter((account) => {
    const customer = account.customer || {};

    const customerName =
      `${customer.firstName || ""} ${customer.lastName || ""}`.toLowerCase();

    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      String(account.id).includes(searchText) ||
      String(account.accountNumber || "")
        .toLowerCase()
        .includes(searchText) ||
      customerName.includes(searchText) ||
      String(customer.email || "")
        .toLowerCase()
        .includes(searchText);

    const matchesStatus =
      statusFilter === "ALL" || account.status?.toUpperCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Freeze / Unfreeze Account
  const handleStatusChange = async (account) => {
    const currentStatus = account.status?.toUpperCase();

    const newStatus = currentStatus === "ACTIVE" ? "FROZEN" : "ACTIVE";

    const confirmed = window.confirm(
      `Are you sure you want to ${
        newStatus === "FROZEN" ? "freeze" : "unfreeze"
      } account ${account.accountNumber}?`,
    );

    if (!confirmed) return;

    try {
      setUpdatingId(account.id);
      setError("");

      await API.patch(`/accounts/${account.id}/status?status=${newStatus}`);

      await fetchAccounts();

      setSelectedAccount((previous) =>
        previous?.id === account.id
          ? { ...previous, status: newStatus }
          : previous,
      );

      alert(
        `Account successfully ${
          newStatus === "FROZEN" ? "frozen" : "activated"
        }.`,
      );
    } catch (err) {
      console.error("Account Status Error:", err);

      setError(
        err.response?.data?.message || "Unable to update account status.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

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

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const activeAccounts = accounts.filter(
    (account) => account.status?.toUpperCase() === "ACTIVE",
  ).length;

  const frozenAccounts = accounts.filter(
    (account) => account.status?.toUpperCase() === "FROZEN",
  ).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-purple-700 p-3 rounded-xl">
              <Wallet className="text-white" size={24} />
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Account Management
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
              All Bank Accounts
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Monitor accounts and manage account status.
            </p>
          </div>

          <button
            onClick={fetchAccounts}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-blue-700 text-white px-5 py-3 rounded-xl hover:bg-blue-800 disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-7">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 p-3 rounded-xl">
                <Wallet className="text-blue-600" size={25} />
              </div>

              <div>
                <p className="text-sm text-slate-500">Total Accounts</p>

                <h3 className="text-2xl font-bold text-slate-900">
                  {accounts.length}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-green-50 p-3 rounded-xl">
                <ShieldCheck className="text-green-600" size={25} />
              </div>

              <div>
                <p className="text-sm text-slate-500">Active Accounts</p>

                <h3 className="text-2xl font-bold text-green-600">
                  {activeAccounts}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-red-50 p-3 rounded-xl">
                <Lock className="text-red-600" size={25} />
              </div>

              <div>
                <p className="text-sm text-slate-500">Frozen Accounts</p>

                <h3 className="text-2xl font-bold text-red-600">
                  {frozenAccounts}
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

        {/* Search and Filter */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />

              <input
                type="text"
                placeholder="Search account number, customer name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Accounts</option>
              <option value="ACTIVE">Active Accounts</option>
              <option value="FROZEN">Frozen Accounts</option>
            </select>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-20">
            <RefreshCw className="animate-spin text-blue-700" size={36} />
          </div>
        ) : (
          /* Accounts Table */
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-600 text-sm">
                  <tr>
                    <th className="px-6 py-4">Account ID</th>
                    <th className="px-6 py-4">Account Number</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Account Type</th>
                    <th className="px-6 py-4">Balance</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredAccounts.length > 0 ? (
                    filteredAccounts.map((account) => {
                      const customer = account.customer || {};

                      const isActive =
                        account.status?.toUpperCase() === "ACTIVE";

                      return (
                        <tr
                          key={account.id}
                          className="hover:bg-slate-50 transition"
                        >
                          <td className="px-6 py-4 font-medium text-slate-700">
                            #{account.id}
                          </td>

                          <td className="px-6 py-4 font-semibold text-slate-900">
                            {account.accountNumber}
                          </td>

                          <td className="px-6 py-4">
                            <p className="font-semibold text-slate-800">
                              {customer.firstName} {customer.lastName}
                            </p>

                            <p className="text-xs text-slate-500">
                              {customer.email || "N/A"}
                            </p>
                          </td>

                          <td className="px-6 py-4 text-slate-600">
                            {account.accountType}
                          </td>

                          <td className="px-6 py-4 font-semibold text-slate-900">
                            {formatCurrency(account.balance)}
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                                isActive
                                  ? "bg-green-50 text-green-700"
                                  : "bg-red-50 text-red-700"
                              }`}
                            >
                              {isActive ? (
                                <ShieldCheck size={14} />
                              ) : (
                                <Lock size={14} />
                              )}

                              {account.status}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setSelectedAccount(account)}
                                title="View Details"
                                className="p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100"
                              >
                                <Eye size={17} />
                              </button>

                              <button
                                onClick={() => handleStatusChange(account)}
                                disabled={updatingId === account.id}
                                title={
                                  isActive
                                    ? "Freeze Account"
                                    : "Unfreeze Account"
                                }
                                className={`p-2 rounded-lg disabled:opacity-50 ${
                                  isActive
                                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                                    : "bg-green-50 text-green-600 hover:bg-green-100"
                                }`}
                              >
                                {updatingId === account.id ? (
                                  <RefreshCw
                                    size={17}
                                    className="animate-spin"
                                  />
                                ) : isActive ? (
                                  <Lock size={17} />
                                ) : (
                                  <Unlock size={17} />
                                )}
                              </button>
                            </div>
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
                        No accounts found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 text-sm text-slate-500">
              Showing {filteredAccounts.length} of {accounts.length} accounts
            </div>
          </div>
        )}
      </main>

      {/* Account Details Modal */}
      {selectedAccount && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="bg-blue-700 text-white px-6 py-5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">Account Details</h3>

                <p className="text-sm text-blue-100">
                  Account ID: #{selectedAccount.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedAccount(null)}
                className="hover:bg-blue-600 p-2 rounded-lg"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <p className="text-sm text-slate-500">Account Number</p>

                <p className="font-semibold text-slate-900">
                  {selectedAccount.accountNumber}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <User className="text-blue-600" size={20} />

                <div>
                  <p className="text-sm text-slate-500">Account Holder</p>

                  <p className="font-semibold text-slate-900">
                    {selectedAccount.customer?.firstName}{" "}
                    {selectedAccount.customer?.lastName}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-500">Email</p>

                <p className="font-medium text-slate-900 break-all">
                  {selectedAccount.customer?.email || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Account Type</p>

                <p className="font-medium text-slate-900">
                  {selectedAccount.accountType}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <IndianRupee className="text-green-600" size={20} />

                <div>
                  <p className="text-sm text-slate-500">Account Balance</p>

                  <p className="font-bold text-lg text-slate-900">
                    {formatCurrency(selectedAccount.balance)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="text-blue-600" size={20} />

                <div>
                  <p className="text-sm text-slate-500">Opening Date</p>

                  <p className="font-medium text-slate-900">
                    {formatDate(selectedAccount.openingDate)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-500">Account Status</p>

                <span
                  className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedAccount.status?.toUpperCase() === "ACTIVE"
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {selectedAccount.status}
                </span>
              </div>
            </div>

            <div className="px-6 pb-6">
              <button
                onClick={() => setSelectedAccount(null)}
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

export default AccountManagement;
