"use client";

import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
interface ApiError {
  message: string;
}

export default function ForgotPassword() {
  const { login } = useAuth();
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  // UI State
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Form Data
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Request Code
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch(`${baseUrl}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // show success for security
      setStep(2);
      setMessage({ type: "success", text: "Check your email for the code!" });
    } catch (err) {
      setMessage({ type: "error", text: "Something went wrong." });
    } finally {
      setIsLoading(false);
    }
  };

  //  Verify & Reset
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch(`${baseUrl}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid code or failed to reset.");
      }

      // Success! Auto-Login
      if (data.access_token) {
        login(data.access_token, data.user);
      }
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setMessage({ type: "error", text: apiErr.message ?? "unkown error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-gray-500 text-sm mt-1">
            {step === 1
              ? "Enter your email to receive a verification code."
              : "Enter the code sent to " + email}
          </p>
        </div>

        {/* Message Banner */}
        {message.text && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm text-center ${
              message.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {step === 1 ? (
          // --- EMAIL ---
          <form onSubmit={handleRequestCode} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-70"
            >
              {isLoading ? "Sending..." : "Send Code"}
            </button>
          </form>
        ) : (
          // --- CODE & NEW PASSWORD ---
          <form onSubmit={handleReset} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Verification Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center tracking-widest font-mono text-lg"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 text-white py-2.5 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-70"
            >
              {isLoading ? "Verifying..." : "Reset & Login"}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-sm text-gray-500 hover:text-gray-700 mt-2"
            >
              Wrong email? Go back
            </button>
          </form>
        )}

        <div className="mt-6 text-center border-t pt-4">
          <Link href="/auth" className="text-sm text-blue-600 hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
