import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Landmark, Mail, Lock, ArrowLeft, ShieldCheck } from "lucide-react";

import API from "../services/api";

function ForgotPassword() {

  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {

    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {

      const response = await API.post("/auth/forgot-password", {
        email: formData.email.trim()
      });

      setMessage(response.data.message);
      setStep(2);

    } catch (err) {

      setError(
        err.response?.data?.message ||
        "Unable to send OTP. Please try again."
      );

    } finally {

      setLoading(false);

    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {

    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {

      const response = await API.post("/auth/verify-otp", {
        email: formData.email.trim(),
        otp: formData.otp.trim()
      });

      setMessage(response.data.message);
      setStep(3);

    } catch (err) {

      setError(
        err.response?.data?.message ||
        "Invalid or expired OTP!"
      );

    } finally {

      setLoading(false);

    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {

    e.preventDefault();

    setMessage("");
    setError("");

    if (formData.newPassword !== formData.confirmPassword) {

      setError("Passwords do not match!");
      return;

    }

    if (formData.newPassword.length < 8) {

      setError("Password must contain at least 8 characters!");
      return;

    }

    setLoading(true);

    try {

      const response = await API.post("/auth/reset-password", {
        email: formData.email.trim(),
        newPassword: formData.newPassword
      });

      setMessage(response.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {

      setError(
        err.response?.data?.message ||
        "Unable to reset password. Please try again."
      );

    } finally {

      setLoading(false);

    }
  };

  return (

    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">

      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2">

        {/* Left Side */}
        <div className="hidden md:flex flex-col justify-between bg-blue-800 text-white p-12">

          <div>

            <div className="flex items-center gap-3">

              <div className="bg-white p-3 rounded-xl">
                <Landmark size={30} className="text-blue-800" />
              </div>

              <h2 className="text-2xl font-bold">
                SecureBank
              </h2>

            </div>

            <h1 className="text-4xl font-bold mt-20 leading-tight">
              Secure Your
              <br />
              Banking Account.
            </h1>

            <p className="text-blue-100 mt-6 leading-7">
              Reset your password securely using the OTP sent to your
              registered email address.
            </p>

          </div>

          <div className="flex items-center gap-3 text-blue-100">

            <ShieldCheck size={24} />

            <span className="text-sm">
              Your security is our priority.
            </span>

          </div>

        </div>

        {/* Right Side */}
        <div className="p-8 md:p-12">

          <div className="flex justify-center md:justify-start mb-8">

            <div className="bg-blue-100 p-4 rounded-2xl">
              <Lock size={35} className="text-blue-700" />
            </div>

          </div>

          <h1 className="text-3xl font-bold text-slate-800">
            {step === 1 && "Forgot Password?"}
            {step === 2 && "Verify OTP"}
            {step === 3 && "Reset Password"}
          </h1>

          <p className="text-gray-500 mt-2">
            {step === 1 && "Enter your registered email to receive an OTP."}
            {step === 2 && "Enter the OTP sent to your registered email."}
            {step === 3 && "Create a new password for your account."}
          </p>

          {/* Success Message */}
          {message && (

            <div className="mt-5 p-3 rounded-lg bg-green-50 text-green-700 text-sm">
              {message}
            </div>

          )}

          {/* Error Message */}
          {error && (

            <div className="mt-5 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              {error}
            </div>

          )}

          {/* Step 1: Email */}
          {step === 1 && (

            <form onSubmit={handleSendOTP} className="mt-8 space-y-6">

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>

                <div className="flex items-center border border-gray-300 rounded-xl px-4 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100">

                  <Mail size={20} className="text-gray-400" />

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your registered email"
                    className="w-full p-4 outline-none bg-transparent"
                    required
                  />

                </div>

              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white py-4 rounded-xl font-semibold transition shadow-lg"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>

            </form>

          )}

          {/* Step 2: OTP */}
          {step === 2 && (

            <form onSubmit={handleVerifyOTP} className="mt-8 space-y-6">

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Enter OTP
                </label>

                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  className="w-full p-4 border border-gray-300 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  required
                />

              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white py-4 rounded-xl font-semibold transition shadow-lg"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setError("");
                  setMessage("");
                  setFormData({
                    ...formData,
                    otp: ""
                  });
                }}
                className="w-full text-blue-700 font-semibold hover:underline"
              >
                Change Email Address
              </button>

            </form>

          )}

          {/* Step 3: New Password */}
          {step === 3 && (

            <form onSubmit={handleResetPassword} className="mt-8 space-y-5">

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  New Password
                </label>

                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  minLength={8}
                  className="w-full p-4 border border-gray-300 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  required
                />

              </div>

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Confirm Password
                </label>

                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  minLength={8}
                  className="w-full p-4 border border-gray-300 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  required
                />

              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white py-4 rounded-xl font-semibold transition shadow-lg"
              >
                {loading ? "Resetting Password..." : "Reset Password"}
              </button>

            </form>

          )}

          {/* Back to Login */}
          <div className="mt-8 text-center">

            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-blue-700 font-semibold hover:underline"
            >
              <ArrowLeft size={18} />
              Back to Login
            </Link>

          </div>

          <div className="mt-10 text-center text-xs text-gray-400">
            © 2026 SecureBank. All Rights Reserved.
          </div>

        </div>

      </div>

    </div>

  );

}

export default ForgotPassword;