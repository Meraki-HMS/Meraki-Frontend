"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BedChart from "../../../components/BedChart";
import Sidebar from "../../../components/Sidebar";
import UpcomingAppointments from "@/components/doctor/appointments/UpcomingAppointments";
import DashboardCard from "@/components/doctor/common/DashboardCard";
import Topbar from "../../../components/Topbar"; // Import dynamic Topbar

export default function Home() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const userString = localStorage.getItem("hmsUser");
    if (!userString) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(userString);
    if (user.role !== "receptionist") {
      router.push("/login");
    }

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) setSidebarOpen(false);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [router]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar Overlay for Mobile */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        ${isMobile ? "fixed inset-y-0 z-50 w-64" : "relative"}
        transition-transform duration-300 ease-in-out
      `}
      >
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      </div>

      {/* Main Content */}
      <main
        className={`
        flex-1 transition-all duration-300
        ${sidebarOpen && !isMobile ? "ml-0" : "ml-0"}
        min-h-screen
      `}
      >
        {/* Dynamic Top Bar */}
        <Topbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Main Content Area */}
        <div className="p-4 lg:p-6">
          {/* 🔹 Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            <DashboardCard
              title="Appointments"
              value="78 today"
              icon="bi bi-calendar-check"
              trend="+12%"
              trendPositive={true}
            />
            <DashboardCard
              title="Patients"
              value="123 active"
              icon="bi bi-people-fill"
              trend="+5%"
              trendPositive={true}
            />
            <DashboardCard
              title="Beds"
              value="56 occupied"
              icon="bi bi-hospital"
              trend="-2%"
              trendPositive={false}
            />
            <DashboardCard
              title="Staff"
              value="80 on duty"
              icon="bi bi-person-badge-fill"
              trend="+8%"
              trendPositive={true}
            />
          </div>

          {/* 🔹 Compact Charts Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
            {/* Bed Occupancy - Compact */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-4 lg:p-5 min-h-[280px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Bed Occupancy
                </h2>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                  Details <i className="bi bi-arrow-right text-xs"></i>
                </button>
              </div>
              <BedChart />
            </div>

            {/* Upcoming Appointments - Compact */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-4 lg:p-5 min-h-[280px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Upcoming Appointments
                </h2>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                  All <i className="bi bi-arrow-right text-xs"></i>
                </button>
              </div>
              <UpcomingAppointments />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
