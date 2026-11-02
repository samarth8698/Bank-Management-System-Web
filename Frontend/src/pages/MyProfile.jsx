import { useEffect, useState } from "react";

import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Map,
  Hash,
  ArrowLeft,
  Save,
  Pencil,
  X,
  Landmark,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import API from "../services/api";

function MyProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [originalProfile, setOriginalProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch Profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await API.get("/customers/me");

        setProfile(response.data);
        setOriginalProfile(response.data);
      } catch (error) {
        console.error("Profile Fetch Error:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        setError("Unable to load profile details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Edit Profile
  const handleEdit = () => {
    setOriginalProfile({ ...profile });
    setEditing(true);
    setError("");
    setSuccess("");
  };

  // Cancel Editing
  const handleCancel = () => {
    setProfile(originalProfile);
    setEditing(false);
    setError("");
    setSuccess("");
  };

  // Update Profile
  const handleSave = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!profile.firstName.trim() || !profile.lastName.trim()) {
      setError("First Name and Last Name are required.");
      return;
    }

    if (profile.phone && !/^\d{10}$/.test(profile.phone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    if (profile.pincode && !/^\d{6}$/.test(profile.pincode)) {
      setError("Please enter a valid 6-digit pincode.");
      return;
    }

    try {
      setSaving(true);

      const response = await API.put("/customers/me", {
        firstName: profile.firstName.trim(),
        lastName: profile.lastName.trim(),
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        pincode: profile.pincode,
      });

      setProfile(response.data);
      setOriginalProfile(response.data);

      setEditing(false);
      setSuccess("Profile updated successfully!");
    } catch (error) {
      console.error("Profile Update Error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setError(
        error.response?.data?.message ||
          "Unable to update profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-xl font-semibold text-blue-800">
          Loading Profile...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Navbar */}
      <nav className="bg-blue-800 text-white px-6 md:px-8 py-5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Landmark size={30} />
          <h1 className="text-2xl font-bold">SecureBank</h1>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 bg-white text-blue-800 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100 transition"
        >
          <ArrowLeft size={18} />
          Dashboard
        </button>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-5 md:p-8">

        {/* Heading */}
        <div className="flex items-center gap-3 mb-8">
          <User size={32} className="text-blue-700" />

          <div>
            <h2 className="text-3xl font-bold text-slate-800">
              My Profile
            </h2>

            <p className="text-gray-500 mt-1">
              View and manage your personal information.
            </p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-5">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-5">
            {success}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-800 to-blue-600 p-8 text-white">

            <div className="flex flex-col sm:flex-row items-center gap-5">

              <div className="w-20 h-20 rounded-full bg-white text-blue-800 flex items-center justify-center">
                <User size={42} />
              </div>

              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold">
                  {profile.firstName} {profile.lastName}
                </h2>

                <p className="text-blue-100 mt-1">
                  {profile.email}
                </p>

                <p className="text-blue-200 text-sm mt-2">
                  SecureBank Customer
                </p>
              </div>

            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="p-6 md:p-8">

            <div className="flex justify-between items-center mb-7">

              <h3 className="text-xl font-bold text-slate-800">
                Personal Information
              </h3>

              {!editing && (
                <button
                  type="button"
                  onClick={handleEdit}
                  className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition"
                >
                  <Pencil size={17} />
                  Edit Profile
                </button>
              )}

            </div>

            {/* Input Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <ProfileInput
                icon={<User />}
                label="First Name"
                name="firstName"
                value={profile.firstName}
                editing={editing}
                onChange={handleChange}
                required
              />

              <ProfileInput
                icon={<User />}
                label="Last Name"
                name="lastName"
                value={profile.lastName}
                editing={editing}
                onChange={handleChange}
                required
              />

              <ProfileInput
                icon={<Mail />}
                label="Email Address"
                name="email"
                value={profile.email}
                editing={false}
                onChange={handleChange}
              />

              <ProfileInput
                icon={<Phone />}
                label="Phone Number"
                name="phone"
                value={profile.phone}
                editing={editing}
                onChange={handleChange}
                maxLength={10}
              />

              <div className="md:col-span-2">
                <ProfileInput
                  icon={<MapPin />}
                  label="Address"
                  name="address"
                  value={profile.address}
                  editing={editing}
                  onChange={handleChange}
                />
              </div>

              <ProfileInput
                icon={<Building2 />}
                label="City"
                name="city"
                value={profile.city}
                editing={editing}
                onChange={handleChange}
              />

              <ProfileInput
                icon={<Map />}
                label="State"
                name="state"
                value={profile.state}
                editing={editing}
                onChange={handleChange}
              />

              <ProfileInput
                icon={<Hash />}
                label="Pincode"
                name="pincode"
                value={profile.pincode}
                editing={editing}
                onChange={handleChange}
                maxLength={6}
              />

            </div>

            {/* Action Buttons */}
            {editing && (
              <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8 border-t pt-6">

                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition disabled:opacity-50"
                >
                  <X size={18} />
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-700 text-white font-semibold hover:bg-blue-800 transition disabled:opacity-50"
                >
                  <Save size={18} />
                  {saving ? "Saving..." : "Save Changes"}
                </button>

              </div>
            )}

          </form>
        </div>

      </main>
    </div>
  );
}

// Profile Input Component
function ProfileInput({
  icon,
  label,
  name,
  value,
  editing,
  onChange,
  required = false,
  maxLength,
}) {
  return (
    <div>

      <label className="block text-sm font-semibold text-slate-600 mb-2">
        {label}
      </label>

      <div
        className={`flex items-center gap-3 border rounded-lg px-4 py-3 ${
          editing
            ? "border-blue-300 bg-white"
            : "border-gray-200 bg-slate-50"
        }`}
      >

        <span className="text-blue-700">
          {icon}
        </span>

        <input
          type="text"
          name={name}
          value={value || ""}
          onChange={onChange}
          readOnly={!editing}
          required={required}
          maxLength={maxLength}
          className="w-full outline-none bg-transparent text-slate-800"
          placeholder={`Enter ${label}`}
        />

      </div>

    </div>
  );
}

export default MyProfile;