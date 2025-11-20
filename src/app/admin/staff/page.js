"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import AddDoctorModal from "../components/AddDoctorModal";
import AddReceptionistModal from "../components/AddReceptionistModal";
import DashboardCard from "../components/DashboardCard";
import Link from "next/link";

export default function StaffManagementPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showReceptionistModal, setShowReceptionistModal] = useState(false);
  const [stats, setStats] = useState({
    totalDoctors: "Loading...",
    totalNurses: "Loading...",
    totalReceptionists: "Loading...",
    totalStaff: "Loading..."
  });

  useEffect(() => {
    const token = localStorage.getItem("hmsToken");
    const user = localStorage.getItem("hmsUser");

    if (!token || !user) {
      router.replace("/admin/login");
      return;
    }

    fetchStaffStats(token);

    // Responsive sidebar handling
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [router]);

  const fetchStaffStats = async (token) => {
    try {
      // Fetch counts for doctors and receptionists
      const [doctorsRes, receptionistsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_BASE}/doctors`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_BASE}/receptionists`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (doctorsRes.ok && receptionistsRes.ok) {
        const doctors = await doctorsRes.json();
        const receptionists = await receptionistsRes.json();
        
        setStats({
          totalDoctors: doctors.length || 0,
          totalNurses: "0", // Since we don't have nurses in schema
          totalReceptionists: receptionists.length || 0,
          totalStaff: (doctors.length + receptionists.length) || 0
        });
      }
    } catch (error) {
      console.error("Error fetching staff stats:", error);
    }
  };

  const handleStaffAdded = () => {
    const token = localStorage.getItem("hmsToken");
    if (token) {
      fetchStaffStats(token);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("hmsToken");
    localStorage.removeItem("hmsUser");
    localStorage.removeItem("loggedIn");
    router.replace("/admin/login");
  };

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
        {/* Top Bar */}
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
                  Staff Management
                </h1>
                <p className="text-sm text-gray-500">
                  Quick statistics and staff registration
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
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <DashboardCard
              title="Total Doctors"
              value={stats.totalDoctors}
              subtitle="1.5% MoM"
              icon="bi bi-person-badge"
              color="blue"
            />
            <DashboardCard
              title="Total Nurses"
              value={stats.totalNurses}
              subtitle="0.5% MoM"
              icon="bi bi-heart-pulse"
              color="green"
            />
            <DashboardCard
              title="Receptionists"
              value={stats.totalReceptionists}
              subtitle="0% MoM"
              icon="bi bi-telephone"
              color="purple"
            />
            <DashboardCard
              title="Total Staff"
              value={stats.totalStaff}
              subtitle="2.0% MoM"
              icon="bi bi-people-fill"
              color="orange"
            />
          </div>

          {/* NEW: View Staff Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  View All Staff
                </h2>
                <p className="text-gray-600 mb-6">
                  View complete list of all staff members including doctors and receptionists with detailed information.
                </p>
                <Link 
                  href="/admin/staff/view"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <i className="bi bi-eye mr-2"></i>
                  View Staff List
                </Link>
              </div>
            </div>

            {/* Onboard New Staff Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Onboard New Staff
              </h2>
              
              <div className="space-y-4">
                <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Add Staff</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowDoctorModal(true)}
                      className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
                    >
                      <span className="text-gray-700">Add Doctor</span>
                      <i className="bi bi-chevron-right text-gray-400"></i>
                    </button>
                    
                    <button
                      onClick={() => setShowReceptionistModal(true)}
                      className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
                    >
                      <span className="text-gray-700">Add Receptionist</span>
                      <i className="bi bi-chevron-right text-gray-400"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showDoctorModal && (
        <AddDoctorModal
          onClose={() => setShowDoctorModal(false)}
          onSuccess={handleStaffAdded}
        />
      )}
      
      {showReceptionistModal && (
        <AddReceptionistModal
          onClose={() => setShowReceptionistModal(false)}
          onSuccess={handleStaffAdded}
        />
      )}
    </div>
  );
}