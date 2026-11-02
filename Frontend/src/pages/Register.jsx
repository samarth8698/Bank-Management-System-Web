import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Landmark, User, Mail, Lock, Phone, MapPin,
  ArrowRight, ShieldCheck
} from "lucide-react";
import API from "../services/api";

function Register() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    password: ""
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {

      const response = await API.post("/auth/register", formData);

      setMessage("Registration successful! Redirecting to login...");

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        password: ""
      });

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (error) {

      setMessage(
        error.response?.data?.message ||
        "Registration failed. Please try again."
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

              <h2 className="text-2xl font-bold">SecureBank</h2>
            </div>

            <h1 className="text-4xl font-bold mt-20 leading-tight">
              Start Your
              <br />
              Banking Journey.
            </h1>

            <p className="text-blue-100 mt-6 leading-7">
              Open your account and experience secure,
              simple and convenient digital banking.
            </p>
          </div>

          <div className="flex items-center gap-3 text-blue-100">
            <ShieldCheck size={24} />
            <span className="text-sm">
              Your information is protected.
            </span>
          </div>

        </div>

        {/* Right Side */}
        <div className="p-8 md:p-12">

          <div className="flex justify-center md:justify-start mb-6">
            <div className="bg-blue-100 p-4 rounded-2xl">
              <Landmark size={35} className="text-blue-700" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-slate-800">
            Create Account
          </h1>

          <p className="text-gray-500 mt-2">
            Register to access online banking.
          </p>

          {message && (
            <div className="mt-4 p-3 rounded-lg bg-blue-50 text-blue-700 text-sm">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">

            {/* First Name and Last Name */}
            <div className="grid grid-cols-2 gap-4">

              <div>
                <label className="block text-sm font-semibold mb-2">
                  First Name
                </label>

                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First name"
                  className="w-full p-3 border rounded-xl outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Last Name
                </label>

                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last name"
                  className="w-full p-3 border rounded-xl outline-none focus:border-blue-600"
                  required
                />
              </div>

            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Email Address
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full p-3 border rounded-xl outline-none focus:border-blue-600"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Phone Number
              </label>

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                className="w-full p-3 border rounded-xl outline-none focus:border-blue-600"
                required
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Address
              </label>

              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your address"
                className="w-full p-3 border rounded-xl outline-none focus:border-blue-600"
                required
              />
            </div>

            {/* City, State, Pincode */}
            <div className="grid grid-cols-2 gap-4">

              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                className="w-full p-3 border rounded-xl outline-none focus:border-blue-600"
                required
              />

              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State"
                className="w-full p-3 border rounded-xl outline-none focus:border-blue-600"
                required
              />

            </div>

            <div>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="Pincode"
                maxLength={6}
                className="w-full p-3 border rounded-xl outline-none focus:border-blue-600"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create password"
                className="w-full p-3 border rounded-xl outline-none focus:border-blue-600"
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white py-4 rounded-xl font-semibold transition"
            >
              {loading ? "Creating Account..." : "Create Account"}
              <ArrowRight size={20} />
            </button>

          </form>

          <p className="text-center text-gray-600 mt-6">
            Already have an account?

            <Link
              to="/login"
              className="text-blue-700 font-bold ml-2 hover:underline"
            >
              Login Now
            </Link>
          </p>

          <div className="mt-7 text-center text-xs text-gray-400">
            © 2026 SecureBank. All Rights Reserved.
          </div>

        </div>

      </div>

    </div>
  );
}

export default Register;
