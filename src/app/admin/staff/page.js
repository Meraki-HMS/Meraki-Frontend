"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AddDoctorModal from "../components/AddDoctorModal";
import AddReceptionistModal from "../components/AddReceptionistModal";
import AddNurseModal from "../components/AddNurseModal";
import DashboardCard from "../components/DashboardCard";
import Link from "next/link";

export default function StaffManagementPage() {
  const router = useRouter();

  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showReceptionistModal, setShowReceptionistModal] = useState(false);
  const [showNurseModal, setShowNurseModal] = useState(false);
  const [showStaffDropdown, setShowStaffDropdown] = useState(false);

  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalNurses: 0,
    totalReceptionists: 0,
    totalStaff: 0,
  });

  const [loading, setLoading] = useState(true);

  /* ---------------- AUTH CHECK ---------------- */

  useEffect(() => {
    const token = localStorage.getItem("hmsToken");
    const user = localStorage.getItem("hmsUser");

    if (!token || !user) {
      router.replace("/admin/login");
      return;
    }

    fetchStaffStats(token);
  }, [router]);

  /* ---------------- FETCH STATS ---------------- */

  const fetchStaffStats = async (token) => {
    try {
      setLoading(true);

      const API_URL =
        process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";

      const hospitalId = localStorage.getItem("hospitalId");

      const [doctorsRes, receptionistsRes, nursesRes] = await Promise.all([
        fetch(`${API_URL}/doctors`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/receptionists`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/nurses/${hospitalId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const doctors = doctorsRes.ok ? await doctorsRes.json() : [];
      const receptionists = receptionistsRes.ok
        ? await receptionistsRes.json()
        : [];
      const nursesData = nursesRes.ok ? await nursesRes.json() : { total: 0 };

      const nursesCount = nursesData.total || 0;

      setStats({
        totalDoctors: doctors.length || 0,
        totalNurses: nursesCount,
        totalReceptionists: receptionists.length || 0,
        totalStaff:
          (doctors.length || 0) +
          (receptionists.length || 0) +
          nursesCount,
      });
    } catch (error) {
      console.error("Error fetching staff stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStaffAdded = () => {
    const token = localStorage.getItem("hmsToken");
    if (token) fetchStaffStats(token);
  };

  const handleLogout = () => {
    localStorage.clear();
    router.replace("/admin/login");
  };

  /* ---------------- CLOSE DROPDOWN ON OUTSIDE CLICK ---------------- */

  useEffect(() => {
    const handleClickOutside = () => {
      setShowStaffDropdown(false);
    };

    if (showStaffDropdown) {
      document.addEventListener("click", handleClickOutside);
      return () =>
        document.removeEventListener("click", handleClickOutside);
    }
  }, [showStaffDropdown]);

  /* ---------------- LOADING STATE ---------------- */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

      {/* Top Bar */}
      <div className="bg-white/80 backdrop-blur-lg border-b sticky top-0 z-30">
        <div className="p-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Staff Management
            </h1>
            <p className="text-sm text-gray-500">
              Quick statistics and staff registration
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="p-2.5 rounded-xl bg-white border text-gray-600 hover:text-red-600 transition"
          >
            <i className="bi bi-box-arrow-right text-xl"></i>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard title="Total Doctors" value={stats.totalDoctors} icon="bi bi-person-badge" />
          <DashboardCard title="Total Nurses" value={stats.totalNurses} icon="bi bi-heart-pulse" />
          <DashboardCard title="Receptionists" value={stats.totalReceptionists} icon="bi bi-telephone" />
          <DashboardCard title="Total Staff" value={stats.totalStaff} icon="bi bi-people-fill" />
        </div>

        {/* View Staff */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="text-xl font-bold mb-4">View All Staff</h2>
            <p className="text-gray-600 mb-6">
              View complete list of doctors, nurses and receptionists.
            </p>
            <Link
              href="/admin/staff/view"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <i className="bi bi-eye mr-2"></i>
              View Staff List
            </Link>
          </div>

          {/* Add Staff */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="text-xl font-bold mb-4">Onboard New Staff</h2>

            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowStaffDropdown(!showStaffDropdown);
                }}
                className="w-full p-3 bg-white border rounded-lg flex justify-between"
              >
                Add New Staff Member
                <i
                  className={`bi bi-chevron-${
                    showStaffDropdown ? "up" : "down"
                  }`}
                ></i>
              </button>

              {showStaffDropdown && (
                <div className="absolute w-full mt-1 bg-white border rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => {
                      setShowDoctorModal(true);
                      setShowStaffDropdown(false);
                    }}
                    className="w-full p-3 text-left hover:bg-gray-50"
                  >
                    Add Doctor
                  </button>
                  <button
                    onClick={() => {
                      setShowNurseModal(true);
                      setShowStaffDropdown(false);
                    }}
                    className="w-full p-3 text-left hover:bg-gray-50"
                  >
                    Add Nurse
                  </button>
                  <button
                    onClick={() => {
                      setShowReceptionistModal(true);
                      setShowStaffDropdown(false);
                    }}
                    className="w-full p-3 text-left hover:bg-gray-50"
                  >
                    Add Receptionist
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
      {showNurseModal && (
        <AddNurseModal
          onClose={() => setShowNurseModal(false)}
          onSuccess={handleStaffAdded}
        />
      )}
    </div>
  );
}
