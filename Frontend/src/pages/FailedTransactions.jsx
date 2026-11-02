import { useEffect, useMemo, useState } from "react";

import {
Landmark,
AlertTriangle,
Search,
RefreshCw,
ArrowLeft,
CalendarDays,
Wallet,
User,
Filter,
XCircle,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import API from "../services/api";

function FailedTransactions() {
const navigate = useNavigate();

const [transactions, setTransactions] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

const [searchTerm, setSearchTerm] = useState("");
const [selectedOperation, setSelectedOperation] = useState("ALL");

// Fetch Failed Transactions
const fetchFailedTransactions = async () => {
try {
setLoading(true);
setError("");

  const response = await API.get("/admin/failed-transactions");

  setTransactions(response.data || []);
} catch (err) {
  console.error("Failed Transactions Error:", err);

  if (err.response?.status === 401) {
    localStorage.removeItem("token");
    navigate("/login");
    return;
  }

  if (err.response?.status === 403) {
    setError("Access Denied! Admin permission required.");
  } else {
    setError(
      err.response?.data?.message ||
        "Unable to load failed transactions."
    );
  }
} finally {
  setLoading(false);
}

};

useEffect(() => {
fetchFailedTransactions();
}, []);

// Currency Formatter
const formatCurrency = (amount) => {
if (amount === null || amount === undefined) {
return "N/A";
}

return new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
}).format(Number(amount));

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

// Search and Filter
const filteredTransactions = useMemo(() => {
return transactions.filter((transaction) => {
const search = searchTerm.toLowerCase();

  const matchesSearch =
    !search ||
    String(transaction.id).includes(search) ||
    String(transaction.customerId).includes(search) ||
    String(transaction.accountId).includes(search) ||
    transaction.operation?.toLowerCase().includes(search) ||
    transaction.reason?.toLowerCase().includes(search);

  const matchesOperation =
    selectedOperation === "ALL" ||
    transaction.operation === selectedOperation;

  return matchesSearch && matchesOperation;
});

}, [transactions, searchTerm, selectedOperation]);

// Statistics
const totalFailed = transactions.length;

const totalFailedAmount = transactions.reduce(
(total, transaction) =>
total + Number(transaction.amount || 0),
0
);

const operations = [
...new Set(transactions.map((item) => item.operation)),
].filter(Boolean);

return ( <div className="min-h-screen bg-slate-50">

  {/* Header */}
  <header className="bg-white border-b border-slate-200 shadow-sm">

    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

      <div className="flex items-center gap-3">

        <div className="bg-red-600 p-3 rounded-xl">
          <Landmark className="w-6 h-6 text-white" />
        </div>

        <div>
          <h1 className="text-xl font-bold text-slate-900">
            SecureBank
          </h1>

          <p className="text-xs text-slate-500">
            Failed Transaction Monitoring
          </p>
        </div>

      </div>

      <button
        onClick={() => navigate("/admin/dashboard")}
        className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition"
      >
        <ArrowLeft size={18} />
        Dashboard
      </button>

    </div>

  </header>

  <main className="max-w-7xl mx-auto px-6 py-8">

    {/* Page Title */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">

      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Failed Transactions
        </h2>

        <p className="text-slate-500 mt-1">
          Monitor and investigate unsuccessful banking operations.
        </p>
      </div>

      <button
        onClick={fetchFailedTransactions}
        disabled={loading}
        className="flex items-center justify-center gap-2 bg-blue-700 text-white px-5 py-3 rounded-xl hover:bg-blue-800 disabled:opacity-50 transition"
      >
        <RefreshCw
          size={18}
          className={loading ? "animate-spin" : ""}
        />
        Refresh
      </button>

    </div>

    {/* Statistics */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

      <div className="bg-white rounded-2xl p-6 border border-red-100 shadow-sm">

        <div className="flex items-center justify-between">

          <div>
            <p className="text-sm text-slate-500 font-medium">
              Total Failed Transactions
            </p>

            <h3 className="text-3xl font-bold text-red-600 mt-2">
              {totalFailed}
            </h3>
          </div>

          <div className="bg-red-50 p-4 rounded-xl">
            <AlertTriangle className="text-red-600" size={28} />
          </div>

        </div>

      </div>

      <div className="bg-white rounded-2xl p-6 border border-orange-100 shadow-sm">

        <div className="flex items-center justify-between">

          <div>
            <p className="text-sm text-slate-500 font-medium">
              Failed Transaction Amount
            </p>

            <h3 className="text-3xl font-bold text-orange-600 mt-2">
              {formatCurrency(totalFailedAmount)}
            </h3>
          </div>

          <div className="bg-orange-50 p-4 rounded-xl">
            <Wallet className="text-orange-600" size={28} />
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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div className="relative">

          <Search
            className="absolute left-4 top-3.5 text-slate-400"
            size={20}
          />

          <input
            type="text"
            placeholder="Search ID, Customer, Account or Reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          />

        </div>

        <div className="relative">

          <Filter
            className="absolute left-4 top-3.5 text-slate-400"
            size={19}
          />

          <select
            value={selectedOperation}
            onChange={(e) => setSelectedOperation(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="ALL">All Operations</option>

            {operations.map((operation) => (
              <option key={operation} value={operation}>
                {operation.replaceAll("_", " ")}
              </option>
            ))}

          </select>

        </div>

      </div>

    </div>

    {/* Transactions Table */}
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

      <div className="p-5 border-b border-slate-200 flex items-center justify-between">

        <h3 className="font-bold text-lg text-slate-900">
          Failed Transaction Records
        </h3>

        <span className="text-sm text-slate-500">
          {filteredTransactions.length} Records
        </span>

      </div>

      {loading ? (

        <div className="py-16 text-center">
          <RefreshCw className="animate-spin mx-auto text-blue-600 mb-3" size={30} />
          <p className="text-slate-500">
            Loading failed transactions...
          </p>
        </div>

      ) : filteredTransactions.length === 0 ? (

        <div className="py-16 text-center">

          <XCircle className="mx-auto text-slate-300 mb-4" size={45} />

          <h3 className="text-lg font-semibold text-slate-700">
            No Failed Transactions Found
          </h3>

          <p className="text-slate-500 mt-2">
            No records match your search or filter.
          </p>

        </div>

      ) : (

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="bg-slate-50 text-slate-600 text-sm">

              <tr>
                <th className="px-5 py-4">Transaction ID</th>
                <th className="px-5 py-4">Customer ID</th>
                <th className="px-5 py-4">Account ID</th>
                <th className="px-5 py-4">Operation</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Reason</th>
                <th className="px-5 py-4">Date & Time</th>
              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {filteredTransactions.map((transaction) => (

                <tr
                  key={transaction.id}
                  className="hover:bg-slate-50 transition"
                >

                  <td className="px-5 py-4 font-semibold text-slate-800">
                    #{transaction.id}
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    <span className="flex items-center gap-2">
                      <User size={16} />
                      {transaction.customerId ?? "N/A"}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {transaction.accountId ?? "N/A"}
                  </td>

                  <td className="px-5 py-4">
                    <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg">
                      {transaction.operation?.replaceAll("_", " ") || "N/A"}
                    </span>
                  </td>

                  <td className="px-5 py-4 font-semibold text-slate-800">
                    {formatCurrency(transaction.amount)}
                  </td>

                  <td className="px-5 py-4">
                    <span className="flex items-center gap-2 text-red-600 font-semibold text-sm">
                      <XCircle size={16} />
                      {transaction.status}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-sm text-red-600 max-w-xs">
                    {transaction.reason || "No reason available"}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-500 whitespace-nowrap">
                    <span className="flex items-center gap-2">
                      <CalendarDays size={16} />
                      {formatDate(transaction.occurredAt)}
                    </span>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>

  </main>

</div>

);
}

export default FailedTransactions;
