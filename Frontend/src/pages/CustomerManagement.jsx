import { useEffect, useState } from "react";
import {
  Users,
  Search,
  RefreshCw,
  Eye,
  Mail,
  Phone,
  MapPin,
  ArrowLeft,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import API from "../services/api";

const CustomerManagement = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Fetch Customers
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/admin/customers");

      setCustomers(response.data);
      setFilteredCustomers(response.data);
    } catch (err) {
      console.error("Customer Fetch Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load customers."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Search Customers
  useEffect(() => {
    const searchText = search.toLowerCase().trim();

    const filtered = customers.filter((customer) => {
      const fullName =
        `${customer.firstName || ""} ${customer.lastName || ""}`.toLowerCase();

      return (
        fullName.includes(searchText) ||
        (customer.email || "").toLowerCase().includes(searchText) ||
        (customer.phone || "").toLowerCase().includes(searchText) ||
        String(customer.id).includes(searchText)
      );
    });

    setFilteredCustomers(filtered);
  }, [search, customers]);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="bg-blue-700 p-3 rounded-xl">
              <Users className="text-white" size={24} />
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Customer Management
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

        {/* Page Heading */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">

          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              All Customers
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              View and search registered bank customers.
            </p>
          </div>

          <button
            onClick={fetchCustomers}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-blue-700 text-white px-5 py-3 rounded-xl hover:bg-blue-800 disabled:opacity-50"
          >
            <RefreshCw
              size={18}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

        </div>

        {/* Statistics */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">

          <div className="flex items-center gap-4">

            <div className="bg-blue-50 p-4 rounded-xl">
              <Users className="text-blue-700" size={28} />
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Total Registered Customers
              </p>

              <h3 className="text-2xl font-bold text-slate-900">
                {customers.length}
              </h3>
            </div>

          </div>

        </div>

        {/* Search */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 shadow-sm">

          <div className="relative">

            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />

            <input
              type="text"
              placeholder="Search by name, email, phone or customer ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (

          <div className="flex justify-center py-20">
            <RefreshCw className="animate-spin text-blue-700" size={36} />
          </div>

        ) : (

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead className="bg-slate-100 text-slate-600 text-sm">

                  <tr>
                    <th className="px-6 py-4">Customer ID</th>
                    <th className="px-6 py-4">Customer Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">City</th>
                    <th className="px-6 py-4 text-center">Action</th>
                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredCustomers.length > 0 ? (

                    filteredCustomers.map((customer) => (

                      <tr
                        key={customer.id}
                        className="hover:bg-slate-50 transition"
                      >

                        <td className="px-6 py-4 font-medium text-slate-700">
                          #{customer.id}
                        </td>

                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {customer.firstName} {customer.lastName}
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {customer.email}
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {customer.phone || "N/A"}
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {customer.city || "N/A"}
                        </td>

                        <td className="px-6 py-4 text-center">

                          <button
                            onClick={() => setSelectedCustomer(customer)}
                            className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100"
                          >
                            <Eye size={16} />
                            View
                          </button>

                        </td>

                      </tr>

                    ))

                  ) : (

                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-12 text-slate-500"
                      >
                        No customers found.
                      </td>
                    </tr>

                  )}

                </tbody>

              </table>

            </div>

            <div className="px-6 py-4 border-t border-slate-100 text-sm text-slate-500">
              Showing {filteredCustomers.length} of {customers.length} customers
            </div>

          </div>

        )}

      </main>

      {/* Customer Details Modal */}
      {selectedCustomer && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">

            <div className="bg-blue-700 text-white px-6 py-5 flex items-center justify-between">

              <div>
                <h3 className="text-xl font-bold">
                  Customer Details
                </h3>

                <p className="text-sm text-blue-100">
                  Customer ID: #{selectedCustomer.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="hover:bg-blue-600 p-2 rounded-lg"
              >
                <X size={22} />
              </button>

            </div>

            <div className="p-6 space-y-5">

              <div>
                <p className="text-sm text-slate-500">Full Name</p>
                <p className="font-semibold text-slate-900">
                  {selectedCustomer.firstName} {selectedCustomer.lastName}
                </p>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="text-blue-600 mt-1" size={20} />

                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="font-medium text-slate-900 break-all">
                    {selectedCustomer.email}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="text-blue-600 mt-1" size={20} />

                <div>
                  <p className="text-sm text-slate-500">Phone</p>
                  <p className="font-medium text-slate-900">
                    {selectedCustomer.phone || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="text-blue-600 mt-1" size={20} />

                <div>
                  <p className="text-sm text-slate-500">Address</p>
                  <p className="font-medium text-slate-900">
                    {selectedCustomer.address || "N/A"},
                    {" "}{selectedCustomer.city || ""},
                    {" "}{selectedCustomer.state || ""}
                    {" "}{selectedCustomer.pincode || ""}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-500">Role</p>
                <span className="inline-block mt-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  {selectedCustomer.role}
                </span>
              </div>

            </div>

            <div className="px-6 pb-6">
              <button
                onClick={() => setSelectedCustomer(null)}
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

export default CustomerManagement;
