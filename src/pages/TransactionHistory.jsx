import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Clock,
  Receipt,
  Wallet,
  ArrowLeft,
} from "lucide-react";
import API from "../services/api";

function TransactionHistory() {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState(
    localStorage.getItem("selectedAccountId") || ""
  );

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const account = accounts.find(
    (acc) => String(acc.id) === String(selectedAccountId)
  );

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccountId) {
      fetchTransactionHistory(selectedAccountId);
    }
  }, [selectedAccountId]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/accounts/my-accounts");
      const accountList = response.data || [];

      setAccounts(accountList);

      if (accountList.length === 0) {
        setError("No bank account found.");
        setTransactions([]);
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

  const fetchTransactionHistory = async (accountId) => {
    try {
      setLoading(true);
      setError("");
      setTransactions([]);

      const response = await API.get(
        `/transactions/history/${accountId}`
      );

      setTransactions(response.data || []);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to load transaction history."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAccountChange = (e) => {
    const accountId = e.target.value;

    setSelectedAccountId(accountId);
    localStorage.setItem("selectedAccountId", accountId);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isDeposit = (type) =>
    type?.toUpperCase() === "DEPOSIT";

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Navbar */}
      <nav className="bg-blue-800 text-white px-6 py-4 flex justify-between items-center shadow">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Wallet size={24} />
          SecureBank
        </h1>

        <button
          onClick={() => navigate("/dashboard")}
          className="bg-white text-blue-800 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100 flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Dashboard
        </button>
      </nav>

      <main className="max-w-6xl mx-auto px-5 py-10">
        {/* Heading */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800">
            Transaction History
          </h2>

          <p className="text-slate-500 mt-2">
            View all your account transactions in one place.
          </p>
        </div>

        {/* Account Selection */}
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

        {/* Account Information */}
        {account && (
          <div className="bg-gradient-to-r from-blue-800 to-blue-600 rounded-xl p-6 text-white mb-8 shadow-lg">
            <p className="text-blue-100 text-sm">
              Account Number
            </p>

            <h3 className="text-2xl font-bold mt-1">
              {account.accountNumber}
            </h3>

            <div className="mt-4 flex justify-between items-center flex-wrap gap-3">
              <span className="text-blue-100">
                {account.accountType}
              </span>

              <span className="font-semibold">
                Balance: ₹
                {Number(account.balance).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-xl p-10 text-center shadow">
            <p className="text-slate-600">
              Loading transactions...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-5">
            {error}
          </div>
        )}

        {/* Transaction List */}
        {!loading && !error && account && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Receipt size={22} />
                Recent Transactions
              </h3>

              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                {transactions.length} Transactions
              </span>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-16">
                <Receipt
                  size={48}
                  className="mx-auto text-slate-300 mb-4"
                />

                <h3 className="text-lg font-semibold text-slate-700">
                  No Transactions Found
                </h3>

                <p className="text-slate-500 mt-2">
                  Your transactions will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-600 text-sm">
                    <tr>
                      <th className="px-6 py-4">Transaction</th>
                      <th className="px-6 py-4">Date & Time</th>
                      <th className="px-6 py-4">Reference</th>
                      <th className="px-6 py-4">Description</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {transactions.map((transaction) => {
                      const deposit = isDeposit(
                        transaction.transactionType
                      );

                      return (
                        <tr
                          key={transaction.id}
                          className="hover:bg-slate-50 transition"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-full ${
                                  deposit
                                    ? "bg-green-100 text-green-600"
                                    : "bg-red-100 text-red-600"
                                }`}
                              >
                                {deposit ? (
                                  <ArrowDownLeft size={20} />
                                ) : (
                                  <ArrowUpRight size={20} />
                                )}
                              </div>

                              <span className="font-semibold text-slate-800">
                                {transaction.transactionType}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <div className="text-slate-700 flex items-center gap-2">
                              <Calendar size={15} />
                              {formatDate(transaction.transactionDate)}
                            </div>

                            <div className="text-slate-400 text-sm mt-1 flex items-center gap-2">
                              <Clock size={14} />
                              {formatTime(transaction.transactionDate)}
                            </div>
                          </td>

                          <td className="px-6 py-5 text-sm text-slate-600">
                            {transaction.referenceNumber || "N/A"}
                          </td>

                          <td className="px-6 py-5 text-sm text-slate-600">
                            {transaction.description || "N/A"}
                          </td>

                          <td
                            className={`px-6 py-5 text-right font-bold whitespace-nowrap ${
                              deposit
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {deposit ? "+" : "-"}₹
                            {Number(transaction.amount).toLocaleString(
                              "en-IN",
                              { minimumFractionDigits: 2 }
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default TransactionHistory;
