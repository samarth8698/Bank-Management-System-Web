import { useEffect, useState } from "react";
import API from "../services/api";
import {
  ClipboardList,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Eye,
  X,
} from "lucide-react";

function AdminAccountOpening() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processingId, setProcessingId] = useState(null);

  // Fetch All Requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/account-opening/admin/all");
      setRequests(response.data);
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

  // Approve Request
  const handleApprove = async (id) => {
    const confirmApprove = window.confirm(
      "Are you sure you want to approve this account opening request?"
    );

    if (!confirmApprove) return;

    try {
      setProcessingId(id);
      setError("");
      setSuccess("");

      await API.patch(`/account-opening/admin/${id}/approve`);

      setSuccess(`Request #${id} approved successfully!`);
      await fetchRequests();
      setSelectedRequest(null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to approve request."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // Open Reject Modal
  const openRejectModal = (request) => {
    setSelectedRequest(request);
    setRejectionReason("");
    setRejectModal(true);
  };

  // Reject Request
  const handleReject = async (e) => {
    e.preventDefault();

    if (!rejectionReason.trim()) {
      setError("Please enter rejection reason.");
      return;
    }

    try {
      setProcessingId(selectedRequest.id);
      setError("");
      setSuccess("");

      await API.patch(
        `/account-opening/admin/${selectedRequest.id}/reject`,
        { rejectionReason }
      );

      setSuccess(
        `Request #${selectedRequest.id} rejected successfully!`
      );

      setRejectModal(false);
      setSelectedRequest(null);
      setRejectionReason("");

      await fetchRequests();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to reject request."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // Status Badge
  const getStatusBadge = (status) => {
    const config = {
      PENDING: {
        style: "bg-yellow-100 text-yellow-700",
        icon: <Clock size={15} />,
      },
      APPROVED: {
        style: "bg-green-100 text-green-700",
        icon: <CheckCircle size={15} />,
      },
      REJECTED: {
        style: "bg-red-100 text-red-700",
        icon: <XCircle size={15} />,
      },
    };

    const item = config[status] || {
      style: "bg-gray-100 text-gray-700",
      icon: null,
    };

    return (
      <span
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${item.style}`}
      >
        {item.icon}
        {status}
      </span>
    );
  };

  // Search + Filter
  const filteredRequests = requests.filter((request) => {
    const customer = request.customer || {};

    const searchText = [
      request.id,
      request.accountType,
      request.status,
      customer.firstName,
      customer.lastName,
      customer.email,
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchText.includes(
      search.toLowerCase()
    );

    const matchesStatus =
      statusFilter === "ALL" ||
      request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = requests.filter(
    (r) => r.status === "PENDING"
  ).length;

  const approvedCount = requests.filter(
    (r) => r.status === "APPROVED"
  ).length;

  const rejectedCount = requests.filter(
    (r) => r.status === "REJECTED"
  ).length;

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold text-slate-800">
              <ClipboardList className="text-blue-600" size={32} />
              Account Opening Requests
            </h1>

            <p className="mt-2 text-slate-500">
              Manage customer account opening applications.
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

        {/* Statistics */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Requests" value={requests.length} />
          <StatCard title="Pending" value={pendingCount} color="text-yellow-600" />
          <StatCard title="Approved" value={approvedCount} color="text-green-600" />
          <StatCard title="Rejected" value={rejectedCount} color="text-red-600" />
        </div>

        {/* Requests Table */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">

          {/* Search + Filter */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search customer, email, request ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500">
              Loading requests...
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              No account opening requests found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left">
                <thead>
                  <tr className="border-b bg-slate-50 text-sm text-slate-600">
                    <th className="px-4 py-4">Request ID</th>
                    <th className="px-4 py-4">Customer</th>
                    <th className="px-4 py-4">Email</th>
                    <th className="px-4 py-4">Account Type</th>
                    <th className="px-4 py-4">Request Date</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRequests.map((request) => {
                    const customer = request.customer || {};

                    return (
                      <tr
                        key={request.id}
                        className="border-b hover:bg-slate-50"
                      >
                        <td className="px-4 py-4 font-semibold">
                          #{request.id}
                        </td>

                        <td className="px-4 py-4 font-medium text-slate-700">
                          {customer.firstName} {customer.lastName}
                        </td>

                        <td className="px-4 py-4 text-sm text-slate-600">
                          {customer.email || "-"}
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

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedRequest(request)}
                              title="View Details"
                              className="rounded-lg bg-blue-100 p-2 text-blue-700 hover:bg-blue-200"
                            >
                              <Eye size={17} />
                            </button>

                            {request.status === "PENDING" && (
                              <>
                                <button
                                  onClick={() => handleApprove(request.id)}
                                  disabled={processingId === request.id}
                                  title="Approve"
                                  className="rounded-lg bg-green-100 p-2 text-green-700 hover:bg-green-200 disabled:opacity-50"
                                >
                                  <CheckCircle size={17} />
                                </button>

                                <button
                                  onClick={() => openRejectModal(request)}
                                  disabled={processingId === request.id}
                                  title="Reject"
                                  className="rounded-lg bg-red-100 p-2 text-red-700 hover:bg-red-200 disabled:opacity-50"
                                >
                                  <XCircle size={17} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Request Details Modal */}
        {selectedRequest && !rejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">
                  Request Details #{selectedRequest.id}
                </h2>

                <button
                  onClick={() => setSelectedRequest(null)}
                  className="rounded-lg p-2 hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <DetailRow
                  label="Customer"
                  value={`${selectedRequest.customer?.firstName || ""} ${selectedRequest.customer?.lastName || ""}`}
                />

                <DetailRow
                  label="Email"
                  value={selectedRequest.customer?.email}
                />

                <DetailRow
                  label="Account Type"
                  value={selectedRequest.accountType}
                />

                <DetailRow
                  label="Request Date"
                  value={
                    selectedRequest.requestDate
                      ? new Date(
                          selectedRequest.requestDate
                        ).toLocaleString()
                      : "-"
                  }
                />

                <DetailRow
                  label="Status"
                  value={selectedRequest.status}
                />

                <DetailRow
                  label="Rejection Reason"
                  value={selectedRequest.rejectionReason || "N/A"}
                />

                <DetailRow
                  label="Reviewed Date"
                  value={
                    selectedRequest.reviewedDate
                      ? new Date(
                          selectedRequest.reviewedDate
                        ).toLocaleString()
                      : "Not Reviewed"
                  }
                />
              </div>

              <button
                onClick={() => setSelectedRequest(null)}
                className="mt-6 w-full rounded-lg bg-slate-800 py-3 font-semibold text-white hover:bg-slate-900"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {rejectModal && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-red-700">
                  Reject Request #{selectedRequest.id}
                </h2>

                <button
                  onClick={() => {
                    setRejectModal(false);
                    setSelectedRequest(null);
                  }}
                  className="rounded-lg p-2 hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleReject}>
                <label className="mb-2 block font-semibold text-slate-700">
                  Rejection Reason
                </label>

                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  required
                  placeholder="Enter reason for rejecting this request..."
                  className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-red-500"
                />

                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setRejectModal(false);
                      setSelectedRequest(null);
                    }}
                    className="flex-1 rounded-lg border border-slate-300 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={processingId === selectedRequest.id}
                    className="flex-1 rounded-lg bg-red-600 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {processingId === selectedRequest.id
                      ? "Rejecting..."
                      : "Confirm Reject"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// Statistics Card
function StatCard({ title, value, color = "text-slate-800" }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <h2 className={`mt-2 text-3xl font-bold ${color}`}>
        {value}
      </h2>
    </div>
  );
}

// Detail Row
function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
      <span className="font-medium text-slate-500">{label}</span>
      <span className="text-right font-semibold text-slate-800">
        {value || "-"}
      </span>
    </div>
  );
}

export default AdminAccountOpening;
