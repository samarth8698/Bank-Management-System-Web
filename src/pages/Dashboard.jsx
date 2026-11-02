import { useEffect, useState } from "react";
import {
  Landmark,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  LogOut,
  User,
  LayoutDashboard,
  CreditCard,
  CalendarDays,
  ShieldCheck,
  Receipt,
  Banknote,
  LockKeyhole,
  ArrowLeftRight,
  FileText,
  PlusCircle,
  ClipboardList,
  CheckCircle,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Dashboard() {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState(
    localStorage.getItem("selectedAccountId") || null,
  );
  const [pinSet, setPinSet] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [accountResponse, pinResponse] = await Promise.all([
          API.get("/accounts/my-accounts"),
          API.get("/accounts/my-accounts/pin-status"),
        ]);

        const accountData = accountResponse.data || [];

        setAccounts(accountData);
        setPinSet(pinResponse.data.pinSet);

        // Restore previously selected account
        if (accountData.length > 0) {
          const savedAccountId = localStorage.getItem("selectedAccountId");

          const validAccount = accountData.find(
            (account) => String(account.id) === String(savedAccountId),
          );

          const accountId = validAccount
            ? String(validAccount.id)
            : String(accountData[0].id);

          setSelectedAccountId(accountId);
          localStorage.setItem("selectedAccountId", accountId);
        }
      } catch (error) {
        console.error("Dashboard Fetch Error:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        setError("Unable to load dashboard details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
  };

  const selectedAccount = accounts.find(
    (account) => String(account.id) === String(selectedAccountId),
  );

  const customer = accounts[0]?.customer;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-xl font-semibold text-blue-800">
          Loading Dashboard...
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
          onClick={handleLogout}
          className="flex items-center gap-2 bg-white text-blue-800 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100"
        >
          <LogOut size={18} />
          Logout
        </button>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-8">
        {/* Dashboard Heading */}
        <div className="flex items-center gap-3 mb-8">
          <LayoutDashboard size={30} className="text-blue-700" />

          <div>
            <h2 className="text-3xl font-bold text-slate-800">Dashboard</h2>

            <p className="text-gray-500">Welcome to your banking dashboard.</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {accounts.length > 0 ? (
          <>
            {/* Welcome Customer */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800">
                Welcome, {customer?.firstName} {customer?.lastName}!
              </h2>

              <p className="text-gray-500 mt-1">
                Manage all your SecureBank accounts from one place.
              </p>
            </div>

            {/* Multiple Accounts Section */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">
                <h2 className="text-xl font-bold text-slate-800">
                  My Bank Accounts ({accounts.length})
                </h2>

                <button
                  onClick={() => navigate("/account-opening")}
                  className="inline-flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800"
                >
                  <PlusCircle size={18} />
                  Open New Account
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accounts.map((account) => {
                  const isSelected =
                    String(selectedAccountId) === String(account.id);

                  return (
                    <button
                      key={account.id}
                      type="button"
                      onClick={() => {
                        const accountId = String(account.id);

                        setSelectedAccountId(accountId);
                        localStorage.setItem("selectedAccountId", accountId);
                      }}
                      className={`text-left p-6 rounded-2xl border-2 transition duration-300 ${
                        isSelected
                          ? "bg-blue-50 border-blue-600 shadow-lg"
                          : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-md"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-5">
                        <div className="bg-blue-100 text-blue-700 p-3 rounded-xl">
                          <Wallet size={28} />
                        </div>

                        {isSelected && (
                          <CheckCircle size={24} className="text-blue-700" />
                        )}
                      </div>

                      <p className="text-sm text-slate-500">
                        {account.accountType} ACCOUNT
                      </p>

                      <h3 className="text-2xl font-bold text-slate-800 mt-2">
                        {formatCurrency(account.balance)}
                      </h3>

                      <p className="text-sm text-slate-600 mt-4 break-all">
                        A/C: {account.accountNumber}
                      </p>

                      <div className="flex justify-between items-center mt-5">
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full ${
                            account.status === "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {account.status}
                        </span>

                        <span className="text-sm font-semibold text-blue-700">
                          {isSelected ? "Selected" : "Select Account"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Account Balance */}
            {selectedAccount && (
              <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white p-8 rounded-2xl shadow-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-blue-100">Selected Account Balance</p>

                    <h1 className="text-4xl font-bold mt-3">
                      {formatCurrency(selectedAccount.balance)}
                    </h1>

                    <p className="text-blue-100 mt-4 break-all">
                      Account Number: {selectedAccount.accountNumber}
                    </p>

                    <p className="text-blue-100 mt-2">
                      Account Type: {selectedAccount.accountType}
                    </p>
                  </div>

                  <Wallet size={55} className="text-blue-200" />
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <h2 className="text-xl font-bold text-slate-800 mt-10 mb-5">
              Quick Actions
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <ActionCard
                icon={<ArrowDownLeft size={28} />}
                title="Deposit"
                color="bg-green-100 text-green-700"
                onClick={() => navigate("/deposit")}
              />

              <ActionCard
                icon={<ArrowUpRight size={28} />}
                title="Withdraw"
                color="bg-red-100 text-red-700"
                onClick={() => navigate("/withdraw")}
              />

              <ActionCard
                icon={<ArrowLeftRight size={28} />}
                title="Fund Transfer"
                color="bg-cyan-100 text-cyan-700"
                onClick={() => navigate("/fund-transfer")}
              />

              <ActionCard
                icon={<Receipt size={28} />}
                title="Transaction History"
                color="bg-blue-100 text-blue-700"
                onClick={() => navigate("/transactions")}
              />

              <ActionCard
                icon={<Banknote size={28} />}
                title="Fast Cash"
                color="bg-purple-100 text-purple-700"
                onClick={() => navigate("/fast-cash")}
              />

              <ActionCard
                icon={<FileText size={28} />}
                title="Mini Statement"
                color="bg-teal-100 text-teal-700"
                onClick={() => navigate("/mini-statement")}
              />

              <ActionCard
                icon={<LockKeyhole size={28} />}
                title={pinSet ? "Change ATM PIN" : "Set ATM PIN"}
                color="bg-orange-100 text-orange-700"
                onClick={() => navigate("/change-pin")}
              />

              <ActionCard
                icon={<User size={28} />}
                title="My Profile"
                color="bg-indigo-100 text-indigo-700"
                onClick={() => navigate("/my-profile")}
              />

              <ActionCard
                icon={<PlusCircle size={28} />}
                title="Open New Account"
                color="bg-emerald-100 text-emerald-700"
                onClick={() => navigate("/account-opening")}
              />

              <ActionCard
                icon={<ClipboardList size={28} />}
                title="My Account Requests"
                color="bg-yellow-100 text-yellow-700"
                onClick={() => navigate("/account-opening")}
              />
            </div>

            {/* Selected Account Information */}
            {selectedAccount && (
              <div className="bg-white p-6 rounded-2xl shadow-sm mt-10">
                <h2 className="text-xl font-bold text-slate-800 mb-6">
                  Selected Account Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoCard
                    icon={<User />}
                    label="Customer Name"
                    value={`${customer?.firstName || ""} ${customer?.lastName || ""}`}
                  />

                  <InfoCard
                    icon={<CreditCard />}
                    label="Account Number"
                    value={selectedAccount.accountNumber}
                  />

                  <InfoCard
                    icon={<Wallet />}
                    label="Account Type"
                    value={selectedAccount.accountType}
                  />

                  <InfoCard
                    icon={<ShieldCheck />}
                    label="Account Status"
                    value={selectedAccount.status}
                  />

                  <InfoCard
                    icon={<CalendarDays />}
                    label="Opening Date"
                    value={selectedAccount.openingDate}
                  />

                  <InfoCard
                    icon={<Landmark />}
                    label="Bank"
                    value="SecureBank"
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white p-10 rounded-2xl shadow-sm text-center">
            <Wallet size={55} className="mx-auto text-blue-700" />

            <h2 className="text-2xl font-bold text-slate-800 mt-5">
              No Bank Account Found
            </h2>

            <p className="text-gray-500 mt-3">
              You don't have any bank account yet.
            </p>

            <button
              onClick={() => navigate("/account-opening")}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              <PlusCircle size={20} />
              Open New Account
            </button>

            <button
              onClick={() => navigate("/account-opening")}
              className="mt-4 ml-3 inline-flex items-center gap-2 rounded-lg border border-blue-600 px-6 py-3 font-semibold text-blue-600 hover:bg-blue-50"
            >
              <ClipboardList size={20} />
              My Account Requests
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

// Action Card Component
function ActionCard({ icon, title, color, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition cursor-pointer"
    >
      <div
        className={`${color} w-14 h-14 rounded-xl flex items-center justify-center`}
      >
        {icon}
      </div>

      <h3 className="font-bold text-slate-800 mt-4">{title}</h3>
    </div>
  );
}

// Information Card Component
function InfoCard({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
      <div className="bg-blue-100 text-blue-700 p-3 rounded-lg">{icon}</div>

      <div>
        <p className="text-sm text-gray-500">{label}</p>

        <p className="font-bold text-slate-800 mt-1">{value || "N/A"}</p>
      </div>
    </div>
  );
}

export default Dashboard;
