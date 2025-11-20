"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import api from "@/utils/api";

export default function RecentAppointmentsPaymentsPage() {
  const router = useRouter();
  const [completedMeetings, setCompletedMeetings] = useState([]);
  const [filteredMeetings, setFilteredMeetings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [allDoctors, setAllDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFilter, setSearchFilter] = useState("all"); // filter selection
  const pageSize = 9;
  const [hospitalId, setHospitalId] = useState(null);

  useEffect(() => {
    const fetchUserAndSetHospitalId = async () => {
      const hmsUser = JSON.parse(localStorage.getItem("hmsUser") || "{}");
      const token = hmsUser?.token;

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const receptionistId = decodedToken.id;
        const res = await api.put(`/receptionists/${receptionistId}/profile`, {}, { headers: { Authorization: `Bearer ${token}` } });
        const hospitalIdFromProfile = res.data.receptionist?.hospital_id;
        setHospitalId(hospitalIdFromProfile);
      } catch (error) {
        console.error("Error fetching receptionist profile for hospital_id:", error);
      }
    };
    fetchUserAndSetHospitalId();
  }, [router]);

  useEffect(() => {
    async function fetchDoctors() {
      if (!hospitalId) return;
      try {
        const res = await api.get(`/receptionists/doctors/${hospitalId}`);
        setAllDoctors(res.data.doctors);
      } catch (error) {
        console.error("Failed to fetch doctors", error);
      }
    }
    fetchDoctors();
  }, [hospitalId]);

  function findDoctorName(doctorId) {
    const doc = allDoctors.find(
      (d) => d.id === doctorId || d._id === doctorId || d.doctorId === doctorId
    );
    return doc?.name || "Unknown Doctor";
  }

  useEffect(() => {
    async function fetchCompletedAppointments() {
      if (!hospitalId) return;
      try {
        const appointmentsRes = await api.get(
          `/api/appointments/hospital/${hospitalId}`
        );
        const formattedAppointments = appointmentsRes.data
          .filter((apt) => apt.status?.toLowerCase() === "completed")
          .map((apt) => ({
            ...apt,
            id: apt.id || apt._id,
            patientName: apt.patientName || "Unknown Patient",
            doctorName: findDoctorName(apt.doctorId),
            reason: apt.reason || "",
            dateObj: new Date(apt.date),
            slotStart: apt.slotStart,
            slotEnd: apt.slotEnd,
            status: "Completed",
          }))
          .sort((a, b) => b.dateObj - a.dateObj);

        setCompletedMeetings(formattedAppointments);
        setFilteredMeetings(formattedAppointments);
      } catch (error) {
        console.error("Failed to fetch appointments", error);
      }
    }
    if (allDoctors.length > 0 && hospitalId) {
      fetchCompletedAppointments();
    }
  }, [allDoctors, hospitalId]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) setSidebarOpen(false);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Updated search filtering logic
  useEffect(() => {
    const term = searchTerm.toLowerCase();

    const filtered = completedMeetings.filter((m) => {
      if (!term) return true;

      if (searchFilter === "patient") {
        return m.patientName.toLowerCase().includes(term);
      } else if (searchFilter === "doctor") {
        return m.doctorName.toLowerCase().includes(term);
      } else if (searchFilter === "date") {
        return m.dateObj.toLocaleDateString("en-GB").includes(term);
      } else {
        return (
          m.patientName.toLowerCase().includes(term) ||
          m.doctorName.toLowerCase().includes(term) ||
          m.dateObj.toLocaleDateString("en-GB").includes(term)
        );
      }
    });

    setFilteredMeetings(filtered);
    setCurrentPage(1);
  }, [searchTerm, searchFilter, completedMeetings]);

  const totalPages = Math.max(1, Math.ceil(filteredMeetings.length / pageSize));
  const pagedCompleted = filteredMeetings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  function formatDate(dateObj) {
    return dateObj.toLocaleDateString("en-GB");
  }

  function formatTime(timeStr) {
    const d = new Date(`1970-01-01T${timeStr}`);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

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

      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen && !isMobile ? "ml-0" : "ml-0"
        } min-h-screen`}
      >
        <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 sticky top-0 z-30">
          <div className="p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-lg bg-white shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
                >
                  <i className="bi bi-list text-xl text-gray-600"></i>
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Payments</h1>
                  <p className="text-sm text-gray-500">
                    Completed appointments ready for billing
                  </p>
                </div>
              </div>

              {/* 🔍 Search Bar & Filter Dropdown */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                {/* Search Bar First */}
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    placeholder={
                      searchFilter === "patient"
                        ? "Search by patient name..."
                        : searchFilter === "doctor"
                        ? "Search by doctor name..."
                        : searchFilter === "date"
                        ? "Search by payment date (DD/MM/YYYY)..."
                        : "Search by patient, doctor, or date..."
                    }
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 pl-10 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <i className="bi bi-search absolute left-3 top-2.5 text-gray-400 text-lg"></i>
                </div>

                {/* Filter Button */}
                <div className="relative">
                  <select
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg bg-white shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="all">All</option>
                    <option value="patient">search by Patient Name</option>
                    <option value="doctor">search by Doctor Name</option>
                    <option value="date">search by Payment Date</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase">
                        Patient
                      </th>
                      <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase">
                        Reason
                      </th>
                      <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase">
                        Doctor
                      </th>
                      <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase">
                        Date
                      </th>
                      <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase">
                        Time
                      </th>
                      <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedCompleted.length > 0 ? (
                      pagedCompleted.map((m) => (
                        <tr
                          key={m.id}
                          className="hover:bg-gray-50 transition-colors duration-150 text-black"
                        >
                          <td className="py-4 px-6">{m.patientName}</td>
                          <td className="py-4 px-6">{m.reason}</td>
                          <td className="py-4 px-6">{m.doctorName}</td>
                          <td className="py-4 px-6">{formatDate(m.dateObj)}</td>
                          <td className="py-4 px-6">{`${formatTime(
                            m.slotStart
                          )} - ${formatTime(m.slotEnd)}`}</td>
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Completed
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-12 text-center text-sm text-gray-500"
                        >
                          No completed appointments found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <button
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage(Math.max(1, currentPage - 1))
                  }
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
