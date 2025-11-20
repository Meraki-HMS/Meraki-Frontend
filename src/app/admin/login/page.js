"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [hospitalId, setHospitalId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false); // 👈 Fix 1: detect client-side
  const [checkingAuth, setCheckingAuth] = useState(true); // 👈 Fix 2: wait before showing UI

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // ✅ Step 1: ensure we’re on client-side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // ✅ Step 2: once client-side confirmed, check auth
  useEffect(() => {
    if (!isClient) return;

    const token = localStorage.getItem("hmsToken");
    const loggedIn = localStorage.getItem("loggedIn");

    if (token && loggedIn === "true") {
      router.replace("/admin/dashboard");
    } else {
      setCheckingAuth(false); // show login page
    }
  }, [isClient, router]);

  const validate = () => {
    const e = {};
    if (!hospitalId.trim()) e.hospitalId = "Hospital ID is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!emailRegex.test(email.trim())) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 6)
      e.password = "Password must be at least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setErrors({});

    try {
      const API_URL = "http://localhost:3000/admins/login";
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailOrMobile: email.trim(),
          password,
          hospital_id: hospitalId.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Invalid credentials");

const token = data.token;
const admin = data.admin;

if (token && admin) {
  localStorage.setItem("hmsToken", token);
  localStorage.setItem("hospitalId", admin.hospital_id); // ✅ Store hospital ID
  localStorage.setItem(
    "hmsUser",
    JSON.stringify({
      id: admin.id,
      email: admin.email,
      hospitalId: admin.hospital_id,
      token,
    })
  );
  localStorage.setItem("loggedIn", "true");
}


      router.push("/admin/dashboard");
    } catch (err) {
      console.error("Login Error:", err.message);
      setErrors({ general: err.message || "Login failed" });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Step 3: prevent flicker
  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // ✅ Step 4: render login page normally
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 p-4">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* LEFT: Brand */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-800 text-white p-10 flex flex-col justify-center">
          <h1 className="text-4xl font-bold mb-4">Meraki HMS</h1>
          <p className="text-blue-100 text-lg mb-6">
            Smart Healthcare for a Smarter Tomorrow.
          </p>
          <ul className="space-y-2 text-sm text-blue-200">
            <li>✔ Secure Admin Portal</li>
            <li>✔ Real-Time Data Access</li>
            <li>✔ Trusted by Hospitals Nationwide</li>
          </ul>
        </div>

        {/* RIGHT: Form */}
        <div className="p-8 lg:p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Admin Login</h2>

          {errors.general && (
            <p className="mb-4 text-red-600 bg-red-50 border border-red-200 rounded-xl py-2 px-4 text-center">
              {errors.general}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hospital ID
              </label>
              <input
                value={hospitalId}
                onChange={(e) => setHospitalId(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border-2 ${
                  errors.hospitalId
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200"
                }`}
                placeholder="HOSP01"
              />
              {errors.hospitalId && (
                <p className="text-red-600 text-sm mt-1">{errors.hospitalId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border-2 ${
                  errors.email
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200"
                }`}
                placeholder="your.email@hospital.com"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    errors.password
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200"
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-4 top-3 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
