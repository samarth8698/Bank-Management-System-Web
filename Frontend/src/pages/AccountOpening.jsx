import { useEffect, useState } from "react";
import api from "../services/api";
import {
  Wallet,
  PlusCircle,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";

function AccountOpening() {
  const [accountType, setAccountType] = useState("SAVINGS");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load Customer Requests
  const fetchRequests = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        "/account-opening/my-requests"
      );

      setRequests(response.data);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load account opening requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Submit Account Opening Request
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const response = await api.post(
        "/account-opening/apply",
        { accountType }
      );

      setSuccess("Account opening request submitted successfully!");

      setRequests((prev) => [response.data, ...prev]);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to submit account opening request."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Status Badge
  const getStatusBadge = (status) => {
    const styles = {
      PENDING: "bg-yellow-100 text-yellow-700",
      APPROVED: "bg-green-100 text-green-700",
      REJECTED: "bg-red-100 text-red-700",
    };

    const icons = {
      PENDING: <Clock size={16} />,
      APPROVED: <CheckCircle size={16} />,
      REJECTED: <XCircle size={16} />,
    };

    return (
      <span
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${
          styles[status] || "bg-gray-100 text-gray-700"
        }`}
      >
        {icons[status]}
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold text-slate-800">
              <Wallet className="text-blue-600" size={32} />
              Account Opening
            </h1>

            <p className="mt-2 text-slate-500">
              Apply for a new bank account and track your requests.
            </p>
          </div>

          <button
            onClick={fetchRequests}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>

        {/* Alerts */}
        {success && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Apply Account */}
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm md:p-8">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-800">
            <PlusCircle className="text-blue-600" />
            Apply for New Account
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="mb-2 block font-semibold text-slate-700">
                Select Account Type
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Savings */}
                <label
                  className={`cursor-pointer rounded-xl border-2 p-5 transition ${
                    accountType === "SAVINGS"
                      ? "border-blue-600 bg-blue-50"
                      : "border-slate-200 hover:border-blue-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="accountType"
                    value="SAVINGS"
                    checked={accountType === "SAVINGS"}
                    onChange={(e) => setAccountType(e.target.value)}
                    className="mr-3 accent-blue-600"
                  />

                  <span className="font-bold text-slate-800">
                    Savings Account
                  </span>

                  <p className="mt-2 text-sm text-slate-500">
                    Personal savings and everyday banking.
                  </p>
                </label>

                {/* Current */}
                <label
                  className={`cursor-pointer rounded-xl border-2 p-5 transition ${
                    accountType === "CURRENT"
                      ? "border-blue-600 bg-blue-50"
                      : "border-slate-200 hover:border-blue-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="accountType"
                    value="CURRENT"
                    checked={accountType === "CURRENT"}
                    onChange={(e) => setAccountType(e.target.value)}
                    className="mr-3 accent-blue-600"
                  />

                  <span className="font-bold text-slate-800">
                    Current Account
                  </span>

                  <p className="mt-2 text-sm text-slate-500">
                    Account for business and regular transactions.
                  </p>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <PlusCircle size={18} />

              {submitting
                ? "Submitting..."
                : "Submit Account Request"}
            </button>
          </form>
        </div>

        {/* My Requests */}
        <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
          <h2 className="mb-6 text-xl font-bold text-slate-800">
            My Account Opening Requests
          </h2>

          {loading ? (
            <div className="py-10 text-center text-slate-500">
              Loading requests...
            </div>
          ) : requests.length === 0 ? (
            <div className="rounded-xl bg-slate-50 py-12 text-center">
              <Wallet
                size={40}
                className="mx-auto mb-3 text-slate-400"
              />

              <h3 className="font-semibold text-slate-700">
                No Requests Found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                You haven't submitted any account opening requests.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left">
                <thead>
                  <tr className="border-b bg-slate-50 text-sm text-slate-600">
                    <th className="px-4 py-3">Request ID</th>
                    <th className="px-4 py-3">Account Type</th>
                    <th className="px-4 py-3">Request Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Rejection Reason</th>
                  </tr>
                </thead>

                <tbody>
                  {requests.map((request) => (
                    <tr
                      key={request.id}
                      className="border-b hover:bg-slate-50"
                    >
                      <td className="px-4 py-4 font-semibold text-slate-700">
                        #{request.id}
                      </td>

                      <td className="px-4 py-4">
                        {request.accountType}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">
                        {request.requestDate
                          ? new Date(
                              request.requestDate
                            ).toLocaleString()
                          : "-"}
                      </td>

                      <td className="px-4 py-4">
                        {getStatusBadge(request.status)}
                      </td>

                      <td className="px-4 py-4 text-sm text-red-600">
                        {request.rejectionReason || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default AccountOpening;
