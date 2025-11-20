"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import api from "@/utils/api";

// Helper: get initials robustly (ignores Dr, whitespace, mixed case, fallback safe)
function getInitials(name) {
  if (!name) return "";
  // Remove Dr. or Dr prefix and whitespace
  const cleaned = name.replace(/^dr\.?\s*/i, "").trim();
  const parts = cleaned.split(/\s+/);
  if (parts.length === 1) return (parts[0][0]||"").toUpperCase();
  return ((parts[0][0]||"") + (parts[parts.length - 1][0]||"")).toUpperCase();
}

function getAvatarColor(name) {
  const colors = [
    "bg-blue-100 text-blue-700"
  ];
  if (!name) return colors[0];
  const idx = (name.replace(/ /g,'').toLowerCase().charCodeAt(0) || 0) % colors.length;
  return colors[idx];
}

export default function StaffDirectory({ onShiftUpdate }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [staffData, setStaffData] = useState([]);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [shifts, setShifts] = useState([{ start: "", end: "" }]);
  const [savedWindows, setSavedWindows] = useState([]);
  const [hospitalId, setHospitalId] = useState("");
  const today = new Date().toISOString().split("T")[0];

  // SSR-safe hospitalId
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userString = localStorage.getItem("hmsUser");
      if (userString) {
        try {
          const user = JSON.parse(userString);
          setHospitalId(user.hospital_id || user.hospitalId || "");
        } catch {}
      }
    }
  }, []);

  useEffect(() => {
    if (!hospitalId) return;
    const fetchDoctors = async () => {
      try {
        const res = await api.get(`/receptionists/doctors/${hospitalId}`)
        const doctors = res.data.doctors || [];
        const formattedStaff = doctors.map((staff) => ({
          ...staff,
          id: staff._id || staff.doctor_id,
          role: "doctor",
          department: staff.specialization,
        }));
        setStaffData(formattedStaff);
      } catch (error) {
        console.error("Failed to fetch doctor data:", error);
        alert(
          "Could not load doctors. Make sure you are logged in and backend is reachable."
        );
      }
    };
    fetchDoctors();
  }, [hospitalId]);

  // Search and filter
  const filteredList = staffData.filter(
    (staff) =>
      staff.name?.toLowerCase().includes(search.toLowerCase()) &&
      (departmentFilter ? staff.department === departmentFilter : true)
  );

  const uniqueDepartments = [
    ...new Set(staffData.map((s) => s.department).filter(Boolean)),
  ];

  const handleShiftChange = (index, field, value) => {
    const newShifts = [...shifts];
    newShifts[index][field] = value;
    setShifts(newShifts);
  };

  const addShift = () => setShifts([...shifts, { start: "", end: "" }]);
  const removeShift = (index) => {
    if (shifts.length > 1) setShifts(shifts.filter((_, i) => i !== index));
  };

  const handleSaveShift = async () => {
    if (!selectedDate)
      return alert("Please select a date for the shift.");
    const validShifts = shifts.filter((s) => s.start && s.end);
    if (validShifts.length === 0)
      return alert("Please enter at least one valid shift.");

    try {
      const data = {
        hospitalId,
        doctorId: selectedStaff._id,
        date: selectedDate,
        slots: validShifts,
      };
      await api.post(`/api/appointments/availability`, data);
      alert("Shift timings saved successfully!");

      // ✅ FIXED: Added /api prefix
      const res = await api.get(
        `/api/appointments/availability/raw/${selectedStaff._id}/${selectedDate}`
      );
      setSavedWindows(Array.isArray(res.data?.slots) ? res.data.slots : []);
      setShifts([{ start: "", end: "" }]);
    } catch (error) {
      console.error("Failed to save shift:", error);
      alert(`Failed to save shift: ${error.message}`);
    }
  };

  useEffect(() => {
    const fetchWindows = async () => {
      if (!selectedStaff || !selectedDate) return setSavedWindows([]);
      try {
        // ✅ FIXED: Added /api prefix
        const res = await api.get(
          `/api/appointments/availability/raw/${selectedStaff._id}/${selectedDate}`
        );
        setSavedWindows(Array.isArray(res.data?.slots) ? res.data.slots : []);
      } catch {
        setSavedWindows([]);
      }
    };
    fetchWindows();
  }, [selectedStaff, selectedDate]);

  const handleDeleteWindow = async (win) => {
    if (!selectedStaff || !selectedDate) return;
    const ok = confirm(
      `Delete shift ${win.start}-${win.end}? Appointments in this window will be removed.`
    );
    if (!ok) return;

    try {
      // Backend expects removeSlots as an array
      await api.post(
        `/api/appointments/availability/remove`,
        { 
          hospitalId: hospitalId,
          doctorId: selectedStaff._id,
          date: selectedDate,
          removeSlots: [{ start: win.start, end: win.end }]  // Array of slot objects
        }
      );

      // Refresh the saved windows
      const res = await api.get(
        `/api/appointments/availability/raw/${selectedStaff._id}/${selectedDate}`
      );
      setSavedWindows(Array.isArray(res.data?.slots) ? res.data.slots : []);
      alert("Shift deleted successfully!");
    } catch (e) {
      console.error("Delete error:", e);
      console.error("Error response:", e.response?.data);
      alert(e.response?.data?.message || e.message || "Failed to delete shift");
    }
  };



  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar (left) */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      {/* Directory content (right) */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">
              Staff Directory
            </h1>
            <p className="text-gray-600 mb-6">
              Find and connect with our healthcare professionals
            </p>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 bg-gray-100 p-1.5 rounded-xl">
              <button className="flex-1 py-3 bg-[#2563eb] text-white rounded-lg shadow-md">
                Doctors
              </button>
              <button
                disabled
                className="flex-1 py-3 text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed"
              >
                Nurses
              </button>
              <button
                disabled
                className="flex-1 py-3 text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed"
              >
                Ambulance
              </button>
            </div>

            {/* Search and filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2563eb]"
                />
              </div>
              <div className="md:w-64">
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="px-4 py-3 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2563eb]"
                >
                  <option value="">All Departments</option>
                  {uniqueDepartments.map((dept, i) => (
                    <option key={i} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Staff cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredList.map((staff) => (
              <div
                key={staff.id}
                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-[#2563eb] hover:shadow-lg transition"
                onClick={() => {
                  setSelectedStaff(staff);
                  setShifts([{ start: "", end: "" }]);
                  setSelectedDate("");
                }}
              >
                <div className="flex flex-col items-center text-center">
                  {/* Initials Profile Avatar */}
                  <div className={`w-12 h-12 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-3 ${getAvatarColor(staff.name)}`}>
                    <span className="text-xl md:text-2xl font-bold">
                      {getInitials(staff.name)}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {staff.name}
                  </h2>
                  <p className="text-sm text-gray-600">{staff.department}</p>
                  <p className="text-xs text-gray-500">{staff.contact}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Modal */}
          {selectedStaff && (
            <div
              className="fixed inset-0 bg-blue-100 bg-opacity-80 flex justify-center items-center z-50 p-4 backdrop-blur-sm"
              onClick={() => setSelectedStaff(null)}
            >
              <div
                className="bg-white p-6 rounded-2xl w-full max-w-md relative shadow-xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    setSelectedStaff(null);
                    setSelectedDate("");
                  }}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full p-1"
                >
                  ✕
                </button>

                {/* Staff info */}
                <div className="flex flex-col items-center text-center">
                  {/* Initials Profile Avatar in Modal */}
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${getAvatarColor(selectedStaff.name)}`}>
                    <span className="text-3xl font-bold">
                      {getInitials(selectedStaff.name)}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedStaff.name}
                  </h2>
                  <p className="text-gray-500">{selectedStaff.department}</p>
                  <p className="text-gray-500 text-sm">
                    {selectedStaff.email || "N/A"}
                  </p>
                </div>
                {/* Shift input */}
                <div className="mt-6">
                  <label className="block text-sm font-medium mb-1">
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={today}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {selectedDate && (
                  <div className="mt-3">
                    {savedWindows.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {savedWindows.map((w, idx) => (
                          <span
                            key={`${w.start}-${idx}`}
                            className="px-2 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs text-blue-700 flex gap-1 items-center"
                          >
                            {w.start} - {w.end}
                            <button
                              onClick={() => handleDeleteWindow(w)}
                              className="text-red-500 ml-1"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">No saved shifts.</p>
                    )}
                  </div>
                )}

                {shifts.map((shift, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 mt-3">
                    <div className="col-span-5">
                      <label className="text-xs font-medium">Start Time</label>
                      <input
                        type="time"
                        value={shift.start}
                        onChange={(e) =>
                          handleShiftChange(i, "start", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-5">
                      <label className="text-xs font-medium">End Time</label>
                      <input
                        type="time"
                        value={shift.end}
                        onChange={(e) =>
                          handleShiftChange(i, "end", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-2 flex items-center">
                      {shifts.length > 1 && (
                        <button
                          onClick={() => removeShift(i)}
                          className="text-red-500 text-lg"
                        >
                          -
                        </button>
                      )}
                      {i === shifts.length - 1 && (
                        <button
                          onClick={addShift}
                          className="text-blue-500 text-lg"
                        >
                          +
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  onClick={handleSaveShift}
                  className="mt-4 bg-blue-600 w-full text-white py-2 rounded-lg"
                >
                  Save Shift
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}