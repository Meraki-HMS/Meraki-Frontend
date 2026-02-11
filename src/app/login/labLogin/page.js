"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function LabLoginPage() {
  const router = useRouter();

  const [hospitalId, setHospitalId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validate = () => {
    const e = {};
    if (!hospitalId.trim()) e.hospitalId = "Hospital ID is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!emailRegex.test(email.trim()))
      e.email = "Enter a valid email address";
    if (!password) e.password = "Password is required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_LAB_API_BASE}/labs/login`,
        {
          email,
          password,
          hospital_id: hospitalId,
        }
      );

      const { token, labid, hospital_id } = response.data;

      const user = {
        hospitalId: hospital_id,
        role: "lab",
        email: email.trim(),
        labid,
        token,
        loggedAt: new Date().toISOString(),
      };

      localStorage.setItem("labLoggedIn", "true");
      localStorage.setItem("hmsUser", JSON.stringify(user));

      alert("✅ Lab Login successful!");
      router.push("/lab/dashboard");
    } catch (error) {
      console.log("🔴 Lab Login error:", error);
      alert(
        error.response?.data?.message ||
          "Login failed. Please check credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-4 relative overflow-hidden">
      
      {/* Left Panel */}
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">

        {/* Branding */}
        <div className="bg-gradient-to-br from-purple-600 via-indigo-700 to-blue-800 p-10 text-white">
          <h1 className="text-4xl font-bold mb-4">
            Welcome to <span className="text-purple-200">Lab Portal</span>
          </h1>
          <p className="text-purple-100 text-lg">
            Manage diagnostic reports and patient tests efficiently.
          </p>

          <div className="grid grid-cols-3 gap-6 mt-10 text-center">
            <div>
              <div className="text-2xl font-bold">200+</div>
              <div className="text-sm text-purple-200">Daily Tests</div>
            </div>
            <div>
              <div className="text-2xl font-bold">99.9%</div>
              <div className="text-sm text-purple-200">Accuracy</div>
            </div>
            <div>
              <div className="text-2xl font-bold">Secure</div>
              <div className="text-sm text-purple-200">Data Protection</div>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="p-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Lab Login
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Hospital ID */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Hospital ID *
              </label>
              <input
                value={hospitalId}
                onChange={(e) => setHospitalId(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl"
                placeholder="HOSP-001"
              />
              {errors.hospitalId && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.hospitalId}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl"
                placeholder="lab@hospital.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl pr-12"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 transition"
            >
              {isLoading ? "Signing In..." : "Sign In to Lab Dashboard"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
