"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import DashboardCard from "../components/DashboardCard";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [stats, setStats] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("hmsToken");
    localStorage.removeItem("hmsUser");
    localStorage.removeItem("loggedIn");
    router.replace("/admin/login");
  };

  useEffect(() => {
    const token = localStorage.getItem("hmsToken");
    const user = localStorage.getItem("hmsUser");

    // ✅ Auth check
    if (!token || !user) {
      router.replace("/admin/login");
      return;
    }

    setAdminUser(JSON.parse(user));

    // ✅ Fetch dashboard stats
    const fetchDashboardData = async () => {
      try {
        const res = await fetch("http://localhost:3000/admins/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load dashboard data");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Dashboard load error:", err);
      }
    };

    fetchDashboardData();

    // ✅ Responsive Sidebar
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [router]);

  if (!adminUser)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${isMobile ? "fixed inset-y-0 z-50 w-64" : "relative"}
        transition-transform duration-300 ease-in-out`}
      >
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      </div>

      <main className="flex-1 min-h-screen">
        <div className="bg-white/80 backdrop-blur-lg border-b sticky top-0 z-30">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg bg-white shadow-sm border hover:shadow-md"
              >
                <i className="bi bi-list text-xl text-gray-600"></i>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-500">
                  Welcome, {adminUser?.email} ({adminUser?.hospitalId})
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-white/80 border text-gray-600 hover:text-red-600 transition"
            >
              <i className="bi bi-box-arrow-right text-xl"></i>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard
              title="Total Staff"
              value={stats?.totalStaff || "Loading..."}
              icon="bi bi-people-fill"
              trend="+3 new"
              trendPositive
            />
            <DashboardCard
              title="Total Patients"
              value={stats?.totalPatients || "Loading..."}
              icon="bi bi-person-hearts"
              trend="+12 today"
              trendPositive
            />
            <DashboardCard
              title="Appointments"
              value={stats?.appointments || "Loading..."}
              icon="bi bi-calendar-check"
              trend="Stable"
              trendPositive
            />
            <DashboardCard
              title="Complaints"
              value={stats?.complaints || "Loading..."}
              icon="bi bi-chat-dots"
              trend="3 pending"
              trendPositive={false}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
