"use client";

import React, { useState } from "react";

function AuthComponent() {
  // call API endpoints for authentication
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  console.log(baseUrl);

  //  toggle between Login and Signup
  const [isLogin, setIsLogin] = useState(true);

  // capture form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLogin) {
      console.log("Logging in with:", formData.email, formData.password);

      try {
        const response = await fetch(`${baseUrl}/auth/signin`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        if (!response.ok) {
          throw new Error("Login failed");
        }

        const data = await response.json();
        console.log("Login success:", data);

        // Example: save token to localStorage
        localStorage.setItem("token", data.access_token);
      } catch (error) {
        console.error("Error logging in:", error);
      }
    } else {
      console.log("Signing up with:", formData);

      try {
        const response = await fetch(`${baseUrl}/auth/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error("Signup failed");
        }

        const data = await response.json();
        console.log("Signup success:", data);

        // Optionally auto-login after signup
        localStorage.setItem("token", data.access_token);
      } catch (error) {
        console.error("Error signing up:", error);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        {/* Header Section */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {isLogin ? "Welcome back" : "Create an account"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin
              ? "Sign in to access your dashboard"
              : "Start organizing your bookmarks today"}
          </p>
        </div>

        {/* The Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            {/* Name Field (Only show for Signup) */}
            {!isLogin && (
              <div>
                <label htmlFor="name" className="sr-only">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required={!isLogin}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Action Button */}
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              {isLogin ? "Sign in" : "Sign up"}
            </button>
          </div>
        </form>

        {/* Toggle Switch Text */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setFormData({ name: "", email: "", password: "" });
              }}
              className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none underline"
            >
              {isLogin ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthComponent;
