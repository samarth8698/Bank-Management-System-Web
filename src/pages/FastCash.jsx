import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet,
  ArrowLeft,
  Banknote,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

import API from "../services/api";

function FastCash() {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState(
    localStorage.getItem("selectedAccountId") || ""
  );

  const [selectedAmount, setSelectedAmount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const amounts = [500, 1000, 2000, 5000, 10000];

  const account = accounts.find(
    (acc) => String(acc.id) === String(accountId)
  );

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Fetch All Accounts
  const fetchAccounts = async () => {
    try {
      setLoading(true);

      const response = await API.get("/accounts/my-accounts");
      const accountData = response.data || [];

      setAccounts(accountData);

      if (accountData.length > 0) {
        setAccountId((previousId) => {
          const exists = accountData.some(
            (acc) => String(acc.id) === String(previousId)
          );

          const finalId = exists
            ? String(previousId)
            : String(accountData[0].id);

          localStorage.setItem("selectedAccountId", finalId);

          return finalId;
        });
      } else {
        setError("No bank account found.");
      }
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to load account details."
      );
    } finally {
      setLoading(false);
    }
  };

  // Fast Cash Withdrawal
  const handleFastCash = async () => {
    if (!selectedAmount || !account) {
      setError("Please select an amount.");
      return;
    }

    if (account.status !== "ACTIVE") {
      setError("Selected account is not active.");
      return;
    }

    if (selectedAmount > Number(account.balance)) {
      setError("Insufficient balance!");
      return;
    }

    try {
      setProcessing(true);
      setError("");
      setMessage("");

      await API.post(
        `/transactions/withdraw/${account.id}`,
        null,
        {
          params: {
            amount: selectedAmount,
          },
        }
      );

      setMessage(
        `₹${selectedAmount.toLocaleString("en-IN")} withdrawn successfully!`
      );

      setSelectedAmount(null);

      await fetchAccounts();
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
        return;
      }

      setError(
        err.response?.data?.message ||
          "Transaction failed. Please try again."
      );
    } finally {
      setProcessing(false);
    }
  };

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

      <main className="max-w-2xl mx-auto px-5 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800">
            Fast Cash
          </h2>

          <p className="text-slate-500 mt-2">
            Select an amount to withdraw instantly.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white p-8 rounded-xl text-center">
            <Loader2 className="animate-spin mx-auto" />
            <p className="mt-2 text-slate-500">
              Loading accounts...
            </p>
          </div>
        )}

        {/* Account Selection */}
        {!loading && accounts.length > 0 && (
          <>
            <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
              <label className="block text-slate-700 font-semibold mb-3">
                Select Bank Account
              </label>

              <select
                value={accountId}
                onChange={(e) => {
                  const value = e.target.value;

                  setAccountId(value);
                  localStorage.setItem("selectedAccountId", value);

                  setSelectedAmount(null);
                  setMessage("");
                  setError("");
                }}
                className="w-full border border-gray-300 rounded-xl px-4 py-4 outline-none focus:ring-2 focus:ring-blue-500"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={String(acc.id)}>
                    {acc.accountType} - {acc.accountNumber} - {acc.status}
                  </option>
                ))}
              </select>
            </div>

            {/* Balance Card */}
            {account && (
              <div className="bg-gradient-to-r from-blue-800 to-blue-600 rounded-xl p-6 text-white mb-8 shadow-lg">
                <p className="text-blue-100 text-sm">
                  Available Balance
                </p>

                <h3 className="text-3xl font-bold mt-2">
                  ₹
                  {Number(account.balance || 0).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </h3>

                <p className="text-blue-100 mt-3 text-sm break-all">
                  Account: {account.accountNumber}
                </p>

                <p className="text-blue-100 mt-2 text-sm">
                  Account Type: {account.accountType}
                </p>
              </div>
            )}

            {/* Fast Cash Card */}
            {account && (
              <div className="bg-white rounded-xl p-7 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-100 text-blue-700 p-3 rounded-lg">
                    <Banknote size={26} />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-800">
                      Select Withdrawal Amount
                    </h3>

                    <p className="text-sm text-slate-500">
                      Choose your preferred amount.
                    </p>
                  </div>
                </div>

                {/* Amount Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                  {amounts.map((amount) => {
                    const disabled =
                      amount > Number(account.balance) ||
                      account.status !== "ACTIVE";

                    return (
                      <button
                        key={amount}
                        type="button"
                        disabled={disabled || processing}
                        onClick={() => {
                          setSelectedAmount(amount);
                          setError("");
                          setMessage("");
                        }}
                        className={`p-5 rounded-xl border-2 font-bold text-lg transition
                          ${
                            selectedAmount === amount
                              ? "border-blue-600 bg-blue-50 text-blue-700"
                              : "border-slate-200 text-slate-700 hover:border-blue-400"
                          }
                          ${
                            disabled
                              ? "opacity-40 cursor-not-allowed"
                              : "cursor-pointer"
                          }`}
                      >
                        ₹{amount.toLocaleString("en-IN")}
                      </button>
                    );
                  })}
                </div>

                {/* Selected Amount */}
                {selectedAmount && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-700">
                      Selected Amount
                    </p>

                    <p className="text-2xl font-bold text-blue-800 mt-1">
                      ₹{selectedAmount.toLocaleString("en-IN")}
                    </p>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-5 flex gap-2">
                    <AlertCircle size={20} />
                    {error}
                  </div>
                )}

                {/* Success Message */}
                {message && (
                  <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-5 flex gap-2">
                    <CheckCircle size={20} />
                    {message}
                  </div>
                )}

                {/* Withdraw Button */}
                <button
                  onClick={handleFastCash}
                  disabled={
                    !selectedAmount ||
                    processing ||
                    account.status !== "ACTIVE"
                  }
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white py-4 rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Processing...
                    </>
                  ) : account.status !== "ACTIVE" ? (
                    "Account Inactive"
                  ) : (
                    "Withdraw Cash"
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {/* Error without Account */}
        {!loading && error && !account && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}
      </main>
    </div>
  );
}

export default FastCash;
