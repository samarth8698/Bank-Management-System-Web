import { useEffect, useState } from "react";
import {
  Landmark,
  Wallet,
  ArrowLeft,
  IndianRupee,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Withdraw() {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);

  // Restore Selected Account from localStorage
  const [selectedAccountId, setSelectedAccountId] = useState(
    localStorage.getItem("selectedAccountId") || ""
  );

  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Selected Account
  const account = accounts.find(
    (acc) => String(acc.id) === String(selectedAccountId)
  );

  // Fetch All Accounts
  const fetchAccounts = async () => {
    try {
      const response = await API.get("/accounts/my-accounts");

      const accountData = response.data || [];

      setAccounts(accountData);

      if (accountData.length > 0) {
        const savedAccountId = localStorage.getItem("selectedAccountId");

        const validAccount = accountData.find(
          (acc) => String(acc.id) === String(savedAccountId)
        );

        const accountId = validAccount
          ? String(validAccount.id)
          : String(accountData[0].id);

        setSelectedAccountId(accountId);

        // Persist Selected Account
        localStorage.setItem("selectedAccountId", accountId);
      } else {
        setSelectedAccountId("");
        setError("No bank account found.");
      }
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
        return;
      }

      setError("Unable to load account details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Withdraw Money
  const handleWithdraw = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const withdrawAmount = Number(amount);

    if (!amount || !Number.isFinite(withdrawAmount) || withdrawAmount <= 0) {
      setError("Please enter a valid withdrawal amount.");
      return;
    }

    if (Math.round(withdrawAmount * 100) !== withdrawAmount * 100) {
      setError("Please enter amount up to 2 decimal places.");
      return;
    }

    if (!account) {
      setError("Please select a bank account.");
      return;
    }

    if (account.status !== "ACTIVE") {
      setError("Selected account is not active.");
      return;
    }

    if (withdrawAmount > Number(account.balance)) {
      setError("Insufficient balance.");
      return;
    }

    try {
      setProcessing(true);

      await API.post(
        `/transactions/withdraw/${account.id}`,
        null,
        {
          params: {
            amount: withdrawAmount,
          },
        }
      );

      setMessage("Money withdrawn successfully!");
      setAmount("");

      // Refresh account balances
      await fetchAccounts();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Withdrawal failed. Please try again."
      );
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-lg font-semibold text-blue-800">
          Loading Accounts...
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
      <main className="max-w-3xl mx-auto p-6 md:p-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800">
            Withdraw Money
          </h2>

          <p className="text-gray-500 mt-2">
            Withdraw money from your SecureBank account.
          </p>
        </div>

        {/* Messages */}
        {message && (
          <div className="flex items-center gap-2 bg-green-100 text-green-700 p-4 rounded-lg mb-5">
            <CheckCircle size={20} />
            {message}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 bg-red-100 text-red-700 p-4 rounded-lg mb-5">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {accounts.length > 0 && (
          <>
            {/* Account Selection */}
            <div className="bg-white p-6 rounded-2xl shadow-sm mb-8">
              <label className="block text-slate-700 font-semibold mb-3">
                Select Bank Account
              </label>

              <select
                value={selectedAccountId}
                onChange={(e) => {
                  const accountId = e.target.value;

                  setSelectedAccountId(accountId);

                  // Persist Selected Account
                  localStorage.setItem("selectedAccountId", accountId);

                  setMessage("");
                  setError("");
                  setAmount("");
                }}
                className="w-full border border-gray-300 rounded-xl px-4 py-4 outline-none focus:ring-2 focus:ring-blue-500"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={String(acc.id)}>
                    {acc.accountType} - {acc.accountNumber}
                  </option>
                ))}
              </select>
            </div>

            {account && (
              <>
                {/* Account Balance */}
                <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white p-7 rounded-2xl shadow-lg mb-8">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-blue-100">
                        Available Balance
                      </p>

                      <h2 className="text-3xl font-bold mt-3">
                        ₹ {Number(account.balance || 0).toFixed(2)}
                      </h2>

                      <p className="text-blue-100 mt-4 break-all">
                        Account: {account.accountNumber}
                      </p>

                      <p className="text-blue-100 mt-2">
                        Account Type: {account.accountType}
                      </p>
                    </div>

                    <Wallet size={45} />
                  </div>
                </div>

                {/* Withdraw Form */}
                <div className="bg-white p-8 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-3 mb-7">
                    <div className="bg-red-100 text-red-700 p-3 rounded-xl">
                      <IndianRupee size={25} />
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-slate-800">
                        Enter Withdrawal Amount
                      </h3>

                      <p className="text-sm text-gray-500">
                        Account Type: {account.accountType}
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleWithdraw}>
                    <label className="block text-slate-700 font-semibold mb-2">
                      Withdrawal Amount (₹)
                    </label>

                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-4 text-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />

                    {/* Quick Amount */}
                    <div className="flex flex-wrap gap-3 mt-5">
                      {[500, 1000, 2000, 5000].map((value) => (
                        <button
                          key={value}
                          type="button"
                          disabled={value > Number(account.balance)}
                          onClick={() => setAmount(String(value))}
                          className="border border-blue-200 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          ₹{value}
                        </button>
                      ))}
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={processing || account.status !== "ACTIVE"}
                      className="w-full bg-red-600 text-white py-4 rounded-xl font-bold mt-8 hover:bg-red-700 transition disabled:opacity-60"
                    >
                      {processing
                        ? "Processing..."
                        : account.status !== "ACTIVE"
                        ? "Account Inactive"
                        : "Withdraw Money"}
                    </button>
                  </form>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default Withdraw;