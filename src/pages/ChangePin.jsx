import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Wallet,
  ArrowLeft,
  LockKeyhole,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import API from "../services/api";

// PIN Input Component
function PinInput({
  label,
  value,
  onChange,
  visible,
  toggleVisibility,
  placeholder,
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        {label}
      </label>

      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          inputMode="numeric"
          maxLength={6}
          value={value}
          onChange={(e) =>
            onChange(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          placeholder={placeholder}
          autoComplete="off"
          className="w-full border border-slate-300 rounded-lg px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />

        <button
          type="button"
          onClick={toggleVisibility}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-700"
          aria-label="Toggle PIN visibility"
        >
          {visible ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      <p className="text-xs text-slate-400 mt-1">
        Enter exactly 6 digits.
      </p>
    </div>
  );
}

// Main Component
function ChangePin() {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState(
    localStorage.getItem("selectedAccountId") || ""
  );

  const [pinSet, setPinSet] = useState(false);

  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const account = accounts.find(
    (acc) => String(acc.id) === String(accountId)
  );

  // Fetch Accounts
  const fetchAccounts = async () => {
    try {
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

      setError("Unable to load account details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Fetch Selected Account PIN Status
  useEffect(() => {
    if (!accountId) return;

    const fetchPinStatus = async () => {
      try {
        setError("");
        setMessage("");

        const response = await API.get(
          `/accounts/${accountId}/pin-status`
        );

        setPinSet(response.data.pinSet);
      } catch (err) {
        console.error("PIN Status Error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load account PIN status."
        );
      }
    };

    fetchPinStatus();
  }, [accountId]);

  // Reset PIN Form
  const resetPinForm = () => {
    setCurrentPin("");
    setNewPin("");
    setConfirmPin("");

    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  // Set PIN or Change PIN
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!account) {
      setError("Please select a bank account.");
      return;
    }

    if (account.status !== "ACTIVE") {
      setError("PIN management is unavailable for inactive accounts.");
      return;
    }

    if (newPin.length !== 6 || confirmPin.length !== 6) {
      setError("New PIN and Confirm PIN must contain exactly 6 digits.");
      return;
    }

    if (pinSet && currentPin.length !== 6) {
      setError("Current PIN must contain exactly 6 digits.");
      return;
    }

    if (newPin !== confirmPin) {
      setError("New PIN and Confirm PIN do not match.");
      return;
    }

    if (pinSet && currentPin === newPin) {
      setError("New PIN must be different from current PIN.");
      return;
    }

    try {
      setProcessing(true);

      let response;

      if (pinSet) {
        response = await API.put("/accounts/change-pin", {
          accountId: account.id,
          currentPin,
          newPin,
          confirmPin,
        });
      } else {
        response = await API.post("/accounts/set-pin", {
          accountId: account.id,
          newPin,
          confirmPin,
        });
      }

      setMessage(
        response.data?.message ||
          (pinSet
            ? "PIN changed successfully!"
            : "ATM PIN set successfully!")
      );

      setPinSet(true);
      resetPinForm();
    } catch (err) {
      console.error("PIN Operation Error:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
        return;
      }

      setError(
        err.response?.data?.message ||
          (pinSet
            ? "Unable to change PIN. Please try again."
            : "Unable to set PIN. Please try again.")
      );
    } finally {
      setProcessing(false);
    }
  };

  const pageTitle = pinSet ? "Change ATM PIN" : "Set ATM PIN";

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

      <main className="max-w-xl mx-auto px-5 py-10">
        {/* Heading */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800">
            {pageTitle}
          </h2>

          <p className="text-slate-500 mt-2">
            {pinSet
              ? "Update your ATM PIN securely."
              : "Create your ATM PIN to use secure banking services."}
          </p>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="bg-white rounded-xl p-10 text-center shadow">
            <Loader2 className="animate-spin mx-auto text-blue-700" />

            <p className="mt-3 text-slate-500">
              Loading account details...
            </p>
          </div>
        ) : accounts.length > 0 ? (
          <>
            {/* Account Selection */}
            <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Select Bank Account
              </label>

              <select
                value={accountId}
                onChange={(e) => {
                  const value = e.target.value;

                  setAccountId(value);
                  localStorage.setItem("selectedAccountId", value);

                  resetPinForm();
                  setMessage("");
                  setError("");
                }}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={String(acc.id)}>
                    {acc.accountType} - {acc.accountNumber} - {acc.status}
                  </option>
                ))}
              </select>
            </div>

            {/* Account Card */}
            {account && (
              <div className="bg-gradient-to-r from-blue-800 to-blue-600 rounded-xl p-6 text-white mb-6 shadow-lg">
                <p className="text-blue-100 text-sm">
                  Account Number
                </p>

                <h3 className="text-2xl font-bold mt-2 break-all">
                  {account.accountNumber}
                </h3>

                <div className="flex justify-between mt-4">
                  <span className="text-blue-100">
                    {account.accountType}
                  </span>

                  <span className="font-semibold">
                    {account.status}
                  </span>
                </div>
              </div>
            )}

            {/* PIN Form */}
            {account && (
              <div className="bg-white rounded-xl p-7 shadow-sm">
                <div className="flex items-center gap-3 mb-7">
                  <div className="bg-blue-100 text-blue-700 p-3 rounded-lg">
                    <LockKeyhole size={25} />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-800">
                      {pinSet ? "Update Your PIN" : "Create Your PIN"}
                    </h3>

                    <p className="text-sm text-slate-500">
                      {pinSet
                        ? "Enter your current and new PIN."
                        : "Enter a new PIN and confirm it."}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Current PIN */}
                  {pinSet && (
                    <PinInput
                      label="Current PIN"
                      value={currentPin}
                      onChange={setCurrentPin}
                      visible={showCurrent}
                      toggleVisibility={() =>
                        setShowCurrent(!showCurrent)
                      }
                      placeholder="Enter current PIN"
                    />
                  )}

                  <PinInput
                    label="New PIN"
                    value={newPin}
                    onChange={setNewPin}
                    visible={showNew}
                    toggleVisibility={() => setShowNew(!showNew)}
                    placeholder="Enter new PIN"
                  />

                  <PinInput
                    label="Confirm New PIN"
                    value={confirmPin}
                    onChange={setConfirmPin}
                    visible={showConfirm}
                    toggleVisibility={() =>
                      setShowConfirm(!showConfirm)
                    }
                    placeholder="Confirm new PIN"
                  />

                  {/* Security Information */}
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
                    <ShieldCheck
                      size={22}
                      className="text-blue-700 shrink-0"
                    />

                    <div>
                      <p className="font-semibold text-blue-800 text-sm">
                        Security Information
                      </p>

                      <p className="text-blue-700 text-xs mt-1">
                        Your PIN is securely stored using BCrypt hashing.
                        Never share your PIN with anyone.
                      </p>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex gap-2">
                      <AlertCircle size={20} className="shrink-0" />
                      {error}
                    </div>
                  )}

                  {/* Success Message */}
                  {message && (
                    <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg flex gap-2">
                      <CheckCircle size={20} className="shrink-0" />
                      {message}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={
                      processing ||
                      account.status !== "ACTIVE"
                    }
                    className="w-full bg-blue-700 hover:bg-blue-800 text-white py-4 rounded-lg font-bold transition disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    {processing ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        {pinSet ? "Updating PIN..." : "Setting PIN..."}
                      </>
                    ) : account.status !== "ACTIVE" ? (
                      "Account Inactive"
                    ) : (
                      pinSet ? "Change PIN" : "Set PIN"
                    )}
                  </button>
                </form>
              </div>
            )}
          </>
        ) : (
          <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-xl">
            {error || "No account found."}
          </div>
        )}
      </main>
    </div>
  );
}

export default ChangePin;
