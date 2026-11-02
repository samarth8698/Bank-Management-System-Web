import { useEffect, useState } from "react";
import {
  Landmark,
  Wallet,
  ArrowLeftRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Send,
  ShieldCheck,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import API from "../services/api";

function FundTransfer() {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState(
    localStorage.getItem("selectedAccountId") || ""
  );

  const [receiverAccountNumber, setReceiverAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");

  const selectedAccount = accounts.find(
    (account) => String(account.id) === String(accountId)
  );

  // Fetch Customer Accounts
  const fetchAccounts = async () => {
    try {
      const response = await API.get("/accounts/my-accounts");

      const accountData = response.data || [];
      setAccounts(accountData);

      if (accountData.length > 0) {
        setAccountId((previousId) => {
          const exists = accountData.some(
            (account) => String(account.id) === String(previousId)
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

      setError("Unable to load bank accounts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Transfer Money
  const handleTransfer = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setReferenceNumber("");

    const transferAmount = Number(amount);
    const receiver = receiverAccountNumber.trim();

    if (!accountId) {
      setError("Please select sender account.");
      return;
    }

    if (!receiver) {
      setError("Please enter receiver account number.");
      return;
    }

    if (receiver.length < 5) {
      setError("Please enter a valid receiver account number.");
      return;
    }

    if (!amount || !Number.isFinite(transferAmount) || transferAmount <= 0) {
      setError("Please enter a valid transfer amount.");
      return;
    }

    if (Math.round(transferAmount * 100) !== transferAmount * 100) {
      setError("Amount must have maximum 2 decimal places.");
      return;
    }

    if (!selectedAccount) {
      setError("Sender account not found.");
      return;
    }

    if (selectedAccount.status !== "ACTIVE") {
      setError("Sender account is not active.");
      return;
    }

    if (receiver === selectedAccount.accountNumber) {
      setError("You cannot transfer money to your own account.");
      return;
    }

    if (transferAmount > Number(selectedAccount.balance)) {
      setError("Insufficient balance.");
      return;
    }

    if (!/^\d{6}$/.test(pin)) {
      setError("ATM PIN must contain exactly 6 digits.");
      return;
    }

    try {
      setProcessing(true);

      const response = await API.post(
        `/transactions/transfer/${accountId}`,
        {
          receiverAccountNumber: receiver,
          amount: String(transferAmount),
          pin,
        }
      );

      const successMessage =
        response.data.message || "Money transferred successfully!";

      setMessage(successMessage);

      const reference = successMessage.includes("Reference Number:")
        ? successMessage.split("Reference Number:")[1].trim()
        : "";

      setReferenceNumber(reference);

      setReceiverAccountNumber("");
      setAmount("");
      setPin("");

      await fetchAccounts();
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
        return;
      }

      setError(
        err.response?.data?.message ||
          "Transfer failed. Please try again."
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
            Fund Transfer
          </h2>

          <p className="text-gray-500 mt-2">
            Transfer money securely to another SecureBank account.
          </p>
        </div>

        {/* Messages */}
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-5">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle size={20} />
              {message}
            </div>

            {referenceNumber && (
              <p className="text-sm mt-3 break-all">
                Reference Number: {referenceNumber}
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 bg-red-100 text-red-700 p-4 rounded-lg mb-5">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Sender Account Balance */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white p-7 rounded-2xl shadow-lg mb-8">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-blue-100">Available Balance</p>

              <h2 className="text-3xl font-bold mt-3">
                ₹ {Number(selectedAccount?.balance || 0).toFixed(2)}
              </h2>

              <p className="text-blue-100 mt-4 break-all">
                Account: {selectedAccount?.accountNumber || "N/A"}
              </p>

              <p className="text-blue-100 mt-2">
                Account Type: {selectedAccount?.accountType || "N/A"}
              </p>
            </div>

            <Wallet size={45} />
          </div>
        </div>

        {/* Transfer Form */}
        <div className="bg-white p-8 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-7">
            <div className="bg-blue-100 text-blue-700 p-3 rounded-xl">
              <ArrowLeftRight size={25} />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-800">
                Transfer Details
              </h3>

              <p className="text-sm text-gray-500">
                Enter receiver and payment details.
              </p>
            </div>
          </div>

          <form onSubmit={handleTransfer}>
            {/* Sender Account */}
            <label className="block text-slate-700 font-semibold mb-2">
              Select Sender Account
            </label>

            <select
              value={accountId}
              onChange={(e) => {
                const value = e.target.value;
                setAccountId(value);
                localStorage.setItem("selectedAccountId", value);
                setMessage("");
                setError("");
              }}
              className="w-full border border-gray-300 rounded-xl px-4 py-4 mb-6 outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {accounts.map((account) => (
                <option key={account.id} value={String(account.id)}>
                  {account.accountNumber} - {account.accountType} - {account.status}
                </option>
              ))}
            </select>

            {/* Receiver Account */}
            <label className="block text-slate-700 font-semibold mb-2">
              Receiver Account Number
            </label>

            <input
              type="text"
              placeholder="Enter receiver account number"
              value={receiverAccountNumber}
              onChange={(e) => setReceiverAccountNumber(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-4 mb-6 outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            {/* Amount */}
            <label className="block text-slate-700 font-semibold mb-2">
              Transfer Amount (₹)
            </label>

            <input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Enter transfer amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-4 mb-6 text-lg outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            {/* Quick Amount */}
            <div className="flex flex-wrap gap-3 mb-6">
              {[100, 500, 1000, 2000].map((value) => (
                <button
                  key={value}
                  type="button"
                  disabled={
                    !selectedAccount ||
                    selectedAccount.status !== "ACTIVE" ||
                    value > Number(selectedAccount.balance)
                  }
                  onClick={() => setAmount(String(value))}
                  className="border border-blue-200 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ₹{value}
                </button>
              ))}
            </div>

            {/* ATM PIN */}
            <label className="block text-slate-700 font-semibold mb-2">
              ATM PIN
            </label>

            <div className="relative mb-3">
              <ShieldCheck
                size={20}
                className="absolute left-4 top-4 text-gray-400"
              />

              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit ATM PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                className="w-full border border-gray-300 rounded-xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-blue-500 tracking-widest"
                required
              />
            </div>

            <p className="text-xs text-gray-500 mb-7">
              Your ATM PIN is securely verified by the bank server.
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={
                processing ||
                accounts.length === 0 ||
                !selectedAccount ||
                selectedAccount.status !== "ACTIVE"
              }
              className="w-full flex items-center justify-center gap-2 bg-blue-700 text-white py-4 rounded-xl font-bold hover:bg-blue-800 transition disabled:opacity-60"
            >
              <Send size={20} />

              {processing
                ? "Processing Transfer..."
                : selectedAccount?.status !== "ACTIVE"
                ? "Account Inactive"
                : "Confirm Transfer"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default FundTransfer;
