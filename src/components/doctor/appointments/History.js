"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

export default function History({ onViewDetails }) {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedDate, setSelectedDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [rangeFilter, setRangeFilter] = useState("all");
  const [sessionTypeFilter, setSessionTypeFilter] = useState("all");

  // ✅ Fetch appointments only after localStorage is available
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const hmsUserRaw = localStorage.getItem("hmsUser");
        if (!hmsUserRaw) {
          setError("Doctor not logged in.");
          setLoading(false);
          return;
        }

        const hmsUser = JSON.parse(hmsUserRaw);
        const doctorId = hmsUser?.doctorid;
        const hospitalId = hmsUser?.hospitalId;

        if (!doctorId) {
          setError("Doctor ID not found.");
          setLoading(false);
          return;
        }

        const API_URL = `http://localhost:3000/doctors/${hospitalId}/${doctorId}/prescribed-appointments`;

        setLoading(true);
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Failed to fetch appointments");
        const data = await response.json();
        setAppointments(data.appointments || []);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setError("Failed to load appointments.");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // ✅ Helper: check if date is within previous day/week/month
  function isInRange(dateStr, range) {
    const today = new Date();
    const date = new Date(dateStr);

    // Previous Day
    if (range === "day") {
      const prevDay = new Date(today);
      prevDay.setDate(today.getDate() - 1);
      return date.toDateString() === prevDay.toDateString();
    }

    // Previous Week (Mon–Sun)
    if (range === "week") {
      const start = new Date(today);
      start.setDate(today.getDate() - 7);
      start.setHours(0, 0, 0, 0);

      return date >= start && date <= today;
    }

    // Previous Month (1st to last day)
    if (range === "month") {
      const prevMonthStart = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1
      );
      const prevMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

      return date >= prevMonthStart && date <= prevMonthEnd;
    }

    return true;
  }

  // ✅ Filters
  // ✅ Filters
  const filteredAppointments = useMemo(() => {
    return appointments
      .filter((app) => {
        const appDate = new Date(app.date).toISOString().split("T")[0];

        // DATE FILTER
        const matchesDate = !selectedDate || selectedDate === appDate;

        // STATUS FILTER
        const matchesStatus =
          statusFilter === "all" ||
          app.status?.toLowerCase() === statusFilter.toLowerCase();

        // TYPE FILTER
        const normalizedType = (app.type || "").toLowerCase();
        const matchesType =
          typeFilter === "all" || normalizedType === typeFilter.toLowerCase();

        // SESSION FILTER
        const matchesSessionType =
          sessionTypeFilter === "all" ||
          app.sessionType?.toLowerCase() === sessionTypeFilter.toLowerCase();

        // RANGE FILTER
        const matchesRange =
          rangeFilter === "all" || isInRange(app.date, rangeFilter);

        return (
          matchesDate &&
          matchesStatus &&
          matchesType &&
          matchesRange &&
          matchesSessionType
        );
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.slotStart || "00:00"}`);
        const dateB = new Date(`${b.date}T${b.slotStart || "00:00"}`);
        return dateB - dateA;
      });
  }, [
    appointments,
    selectedDate,
    statusFilter,
    typeFilter,
    rangeFilter,
    sessionTypeFilter,
  ]);

  // ✅ Color helper
  // ✅ Row background color helper
  const getRowClass = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 hover:bg-green-200";
      case "cancelled":
        return "bg-red-100 hover:bg-red-200";
      default:
        return "bg-white hover:bg-gray-50"; // For scheduled or others
    }
  };

  // ✅ Status text color helper
  const getStatusTextColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-800 font-semibold";
      case "cancelled":
        return "text-red-800 font-semibold";
      default:
        return "text-gray-700 font-medium";
    }
  };

  if (loading)
    return (
      <div className="text-center py-12 text-gray-500">
        <i className="bi bi-hourglass-split text-3xl mb-2"></i>
        <p>Loading appointments...</p>
      </div>
    );

  if (error)
    return (
      <div className="text-center py-12 text-red-500">
        <i className="bi bi-exclamation-triangle text-3xl mb-2"></i>
        <p>{error}</p>
      </div>
    );

  return (
    <div>
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-800">
          Appointments History
        </h2>
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-wrap">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={today}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="scheduled">Scheduled</option>
          </select>
          {/* <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
          >
            <option value="all">All Types</option>
            <option value="virtual">Virtual</option>
            <option value="walk-in">Walk-in</option>
            <option value="offline">Offline</option>
          </select> */}
          <select
            value={rangeFilter}
            onChange={(e) => setRangeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
          >
            <option value="all">All Time</option>
            <option value="day">Previous Day</option>
            <option value="week">Previous Week</option>
            <option value="month">Previous Month</option>
          </select>
          {/* <select
            value={sessionTypeFilter}
            onChange={(e) => setSessionTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
          >
            <option value="all">All Session Types</option>
            <option value="Checkup">Checkup</option>
            <option value="Follow-Up">Follow-Up</option>
            <option value="Therapy">Therapy</option>
            <option value="Consultation">Consultation</option>
          </select> */}
        </div>
      </div>

      {/* Table */}
      {filteredAppointments.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 text-left text-gray-900">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-3 border-b">Date</th>
                <th className="py-2 px-3 border-b">Start Time</th>
                <th className="py-2 px-3 border-b">End Time</th>
                <th className="py-2 px-3 border-b">Patient</th>
                <th className="py-2 px-3 border-b">Type</th>
                {/* <th className="py-2 px-3 border-b">Session</th>
                <th className="py-2 px-3 border-b">Reason</th> */}
                <th className="py-2 px-3 border-b">Status</th>
                <th className="py-2 px-3 border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((app, idx) => (
                <tr
                  key={app._id || `history-${idx}`}
                  className={`${getRowClass(
                    app.status
                  )} hover:shadow transition-shadow`}
                >
                  <td className="py-2 px-3 border-b">
                    {app.date
                      ? new Date(app.date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "N/A"}
                  </td>
                  <td className="py-2 px-3 border-b">
                    {app.slotStart || "N/A"}
                  </td>
                  <td className="py-2 px-3 border-b">{app.slotEnd || "N/A"}</td>
                  <td className="py-2 px-3 border-b">
                    {app.patientName || "N/A"}
                  </td>
                  <td className="py-2 px-3 border-b capitalize">
                    {app.type?.replace("-", " ") || "Manual"}
                  </td>
                  {/* <td className="py-2 px-3 border-b">{app.sessionType || "N/A"}</td>
                  <td className="py-2 px-3 border-b">{app.reason || "N/A"}</td> */}
                  <td
                    className={`py-2 px-3 border-b capitalize ${getStatusTextColor(
                      app.status
                    )}`}
                  >
                    {app.status || "Scheduled"}
                  </td>
                  <td className="py-2 px-3 border-b space-x-2">
                    <button
                      onClick={() => onViewDetails && onViewDetails(app)}
                      className="px-3 py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <i className="bi bi-calendar-x text-4xl text-gray-300 mb-4"></i>
          <h3 className="text-lg font-medium text-gray-500">
            No History Found
          </h3>
          <p className="text-gray-400 mt-1">
            No appointments match the selected filters.
          </p>
        </div>
      )}
    </div>
  );
}
