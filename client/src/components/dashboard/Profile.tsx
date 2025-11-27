"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faLock,
  faShieldAlt,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";

// Interface for the detailed user profile
interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

function Profile() {
  const { user, token } = useAuth();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Password Form State
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordMessage, setPasswordMessage] = useState({
    type: "",
    text: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // 1. Fetch User Details on Mount
  useEffect(() => {
    if (user && token) {
      fetchUserProfile();
    }
  }, [user, token]);

  const fetchUserProfile = async () => {
    try {
      // Use ID from the context to fetch full details
      const res = await fetch(`${baseUrl}/users/${user?.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (error) {
      console.error("Failed to load profile", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Password Change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage({ type: "", text: "" });

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordMessage({
        type: "error",
        text: "New passwords do not match.",
      });
      return;
    }

    if (passwords.newPassword.length < 6) {
      setPasswordMessage({
        type: "error",
        text: "Password must be at least 6 characters.",
      });
      return;
    }

    setIsSaving(true);

    try {
      // the PATCH endpoint
      const res = await fetch(`${baseUrl}/users/${user?.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          password: passwords.newPassword,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update password");
      }

      setPasswordMessage({
        type: "success",
        text: "Password updated successfully!",
      });
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setPasswordMessage({
        type: "error",
        text: "Could not update password. Try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading profile...</div>;
  if (!profile) return <div className="p-8">User not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Account Settings</h1>

      {/* --- USER DETAILS CARD --- */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <FontAwesomeIcon icon={faUser} className="text-blue-500" />
          Personal Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-500">
              Full Name
            </label>
            <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-800 border border-gray-100 font-medium">
              {profile.name}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">
              Email Address
            </label>
            <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-800 border border-gray-100 flex items-center gap-2">
              <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
              {profile.email}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">
              Account Role
            </label>
            <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-800 border border-gray-100 flex items-center gap-2">
              <FontAwesomeIcon icon={faShieldAlt} className="text-gray-400" />
              <span className="capitalize">{profile.role}</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- CHANGE PASSWORD --- */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <FontAwesomeIcon icon={faLock} className="text-purple-500" />
          Security
        </h2>

        {passwordMessage.text && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm ${
              passwordMessage.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {passwordMessage.type === "success" && (
              <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
            )}
            {passwordMessage.text}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="max-w-md space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              value={passwords.newPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, newPassword: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              value={passwords.confirmPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, confirmPassword: e.target.value })
              }
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-70"
          >
            {isSaving ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
