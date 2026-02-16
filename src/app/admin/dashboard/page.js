"use client";

import { useRouter } from "next/navigation";
import DashboardCard from "../components/DashboardCard";

export default function AdminDashboardPage() {
  const router = useRouter();

  const adminUser = {
    email: "admin@hospital.com",
    hospitalId: "HOSP001",
  };

  const stats = {
    totalStaff: 48,
    totalPatients: 124,
    appointments: 32,
    complaints: 3,
  };

  const handleLogout = () => {
    // Clear all local storage
    localStorage.clear();

    // Optional: remove specific keys only
    // localStorage.removeItem("token");
    // localStorage.removeItem("user");

    // Redirect to login page
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      
      {/* Top Bar */}
      <div className="bg-white/80 backdrop-blur-lg border-b sticky top-0 z-30">
        <div className="p-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Admin Dashboard
            </h1>
            <p className="text-sm text-gray-500">
              Welcome, {adminUser.email} ({adminUser.hospitalId})
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="p-2.5 rounded-xl bg-white/80 border text-gray-600 hover:text-red-600 transition"
          >
            <i className="bi bi-box-arrow-right text-xl"></i>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            title="Total Staff"
            value={stats.totalStaff}
            icon="bi bi-people-fill"
            trend="+3 new"
            trendPositive
          />
          <DashboardCard
            title="Total Patients"
            value={stats.totalPatients}
            icon="bi bi-person-hearts"
            trend="+12 today"
            trendPositive
          />
          <DashboardCard
            title="Appointments"
            value={stats.appointments}
            icon="bi bi-calendar-check"
            trend="Stable"
            trendPositive
          />
          <DashboardCard
            title="Complaints"
            value={stats.complaints}
            icon="bi bi-chat-dots"
            trend="3 pending"
            trendPositive={false}
          />
        </div>
      </div>
    </div>
  );
}
