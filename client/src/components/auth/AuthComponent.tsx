"use client";

import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

function AuthComponent() {
  const { login } = useAuth();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  // process server response
  const handleServerResponse = (data: AuthResponse) => {
    if (data.access_token && data.user) {
      // IMMEDIATE UPDATE: Update Context & LocalStorage instantly
      login(data.access_token, data.user);
    } else {
      throw new Error("Server response missing token or user data");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isLogin) {
        // --- LOGIN FUNCTION ---
        console.log("Attempting Login...");
        const response = await fetch(`${baseUrl}/auth/signin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Login failed");

        handleServerResponse(data);
      } else {
        // --- SIGNUP FUNCTION (Restored) ---
        console.log("Attempting Signup...");
        const response = await fetch(`${baseUrl}/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // Send name, email, and password for signup
          body: JSON.stringify(formData),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Signup failed");

        handleServerResponse(data);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Auth Error:", err);
        setError(err.message);
      } else {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center border border-red-200">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            {/* Name is only required for Signup */}
            {!isLogin && (
              <input
                name="name"
                type="text"
                required={!isLogin}
                className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
              />
            )}

            <input
              name="email"
              type="email"
              required
              className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
            />

            <input
              name="password"
              type="password"
              required
              className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white 
              ${
                isLoading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } 
              transition-colors duration-200`}
          >
            {isLoading ? "Processing..." : isLogin ? "Sign in" : "Sign up"}
          </button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setFormData({ name: "", email: "", password: "" });
              setError("");
            }}
            className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline focus:outline-none"
          >
            {isLogin ? "Need an account? Sign up" : "Have an account? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthComponent;
