import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Landmark,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import API from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ================= HANDLE INPUT =================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ================= LOGIN API =================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const loginData = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      };

      const response = await API.post(
        "/auth/login",
        loginData
      );

      // ================= LOGIN RESPONSE =================

      const data = response.data;

      console.log("========== LOGIN RESPONSE ==========");
      console.log("FULL RESPONSE:", data);
      console.log("TOKEN:", data.token);
      console.log("ROLE:", data.role);
      console.log("CUSTOMER ID:", data.customerId);
      console.log("EMAIL:", data.email);
      console.log("===================================");

      const token = data.token;

      const role = String(data.role || "")
        .trim()
        .toUpperCase();

      const customerId = data.customerId;
      const email = data.email || loginData.email;

      // ================= VALIDATION =================

      if (!token) {
        throw new Error(
          "Authentication token not received!"
        );
      }

      if (!role) {
        throw new Error(
          "User role not received from backend!"
        );
      }

      if (
        role !== "ADMIN" &&
        role !== "CUSTOMER"
      ) {
        throw new Error(
          `Invalid user role received: ${role}`
        );
      }

      // ================= CLEAR OLD SESSION =================

      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("customerId");
      localStorage.removeItem("email");

      // ================= SAVE NEW SESSION =================

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      if (customerId != null) {
        localStorage.setItem(
          "customerId",
          String(customerId)
        );
      }

      localStorage.setItem("email", email);

      // ================= SUCCESS MESSAGE =================

      setMessage("Login successful!");

      // ================= ADMIN REDIRECT =================

      if (role === "ADMIN") {
        console.log("Redirecting to ADMIN Dashboard");

        navigate("/admin/dashboard", {
          replace: true,
        });

        return;
      }

      // ================= CUSTOMER REDIRECT =================

      if (role === "CUSTOMER") {
        console.log("Redirecting to CUSTOMER Dashboard");

        navigate("/dashboard", {
          replace: true,
        });

        return;
      }

    } catch (error) {
      console.error("========== LOGIN ERROR ==========");
      console.error(error);
      console.error("================================");

      // Clear invalid session
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("customerId");
      localStorage.removeItem("email");

      setMessage(
        error.response?.data?.message ||
        error.message ||
        "Invalid email or password!"
      );

    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">

      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2">

        {/* LEFT SIDE */}

        <div className="hidden md:flex flex-col justify-between bg-blue-800 text-white p-12">

          <div>

            <div className="flex items-center gap-3">

              <div className="bg-white p-3 rounded-xl">
                <Landmark
                  size={30}
                  className="text-blue-800"
                />
              </div>

              <h2 className="text-2xl font-bold">
                SecureBank
              </h2>

            </div>

            <h1 className="text-4xl font-bold mt-20 leading-tight">
              Banking Made
              <br />
              Simple & Secure.
            </h1>

            <p className="text-blue-100 mt-6 leading-7">
              Manage your accounts, transfer money and track
              your transactions securely from anywhere.
            </p>

          </div>

          <div className="flex items-center gap-3 text-blue-100">

            <ShieldCheck size={24} />

            <span className="text-sm">
              Your security is our priority.
            </span>

          </div>

        </div>

        {/* RIGHT SIDE */}

        <div className="p-8 md:p-12">

          <div className="flex justify-center md:justify-start mb-8">

            <div className="bg-blue-100 p-4 rounded-2xl">

              <Landmark
                size={35}
                className="text-blue-700"
              />

            </div>

          </div>

          <h1 className="text-3xl font-bold text-slate-800">
            Welcome Back!
          </h1>

          <p className="text-gray-500 mt-2">
            Login to access your banking dashboard.
          </p>

          {/* MESSAGE */}

          {message && (
            <div className="mt-5 p-3 rounded-lg bg-blue-50 text-blue-700 text-sm">
              {message}
            </div>
          )}

          {/* LOGIN FORM */}

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-6"
          >

            {/* EMAIL */}

            <div>

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>

              <div className="flex items-center border border-gray-300 rounded-xl px-4 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100">

                <Mail
                  size={20}
                  className="text-gray-400"
                />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full p-4 outline-none bg-transparent"
                  required
                />

              </div>

            </div>

            {/* PASSWORD */}

            <div>

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>

              <div className="flex items-center border border-gray-300 rounded-xl px-4 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100">

                <Lock
                  size={20}
                  className="text-gray-400"
                />

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full p-4 outline-none bg-transparent"
                  required
                />

              </div>

            </div>

            {/* FORGOT PASSWORD */}

            <div className="flex justify-end -mt-3">

              <Link
                to="/forgot-password"
                className="text-sm text-blue-700 font-semibold hover:underline"
              >
                Forgot Password?
              </Link>

            </div>

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white py-4 rounded-xl font-semibold transition duration-300 shadow-lg shadow-blue-200"
            >

              {loading
                ? "Logging in..."
                : "Login to Account"}

              <ArrowRight size={20} />

            </button>

          </form>

          {/* REGISTER */}

          <p className="text-center text-gray-600 mt-8">

            Don't have an account?

            <Link
              to="/register"
              className="text-blue-700 font-bold ml-2 hover:underline"
            >
              Register Now
            </Link>

          </p>

          {/* FOOTER */}

          <div className="mt-10 text-center text-xs text-gray-400">
            © 2026 SecureBank. All Rights Reserved.
          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;
