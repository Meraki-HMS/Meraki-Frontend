"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [view, setView] = useState("grid");
  const [loading, setLoading] = useState(true);

  // ✅ Read from localStorage
  const storedUser = typeof window !== "undefined" ? localStorage.getItem("hmsUser") : null;
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;
  const hospitalId = parsedUser?.hospitalId;
  const doctorId = parsedUser?.doctorid;

  useEffect(() => {
    if (!hospitalId || !doctorId) {
      console.error("❌ Missing hospitalId or doctorId in localStorage");
      setLoading(false);
      return;
    }

    const fetchPatients = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/doctors/${hospitalId}/${doctorId}/patients`
        );
        console.log("✅ Patients fetched:", res.data);

        const apiPatients = res.data.patients.map((p) => ({
          id: p._id,
          name: p.name || "Unknown",
          email: p.email || "N/A",
          phone: p.phone || "N/A",
          gender: p.gender || "N/A",
          age: p.dob ? calculateAge(p.dob) : "N/A",
          status: "active",
          source: p.source,
        }));

        setPatients(apiPatients);
        setFilteredPatients(apiPatients);
      } catch (err) {
        console.error("❌ Error fetching patients:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [hospitalId, doctorId]);

  // ✅ Search + Filter
  useEffect(() => {
    let filtered = [...patients];

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    setFilteredPatients(filtered);
  }, [searchTerm, statusFilter, patients]);

  // Helper: calculate age
  const calculateAge = (dob) => {
    const birth = new Date(dob);
    const diff = Date.now() - birth.getTime();
    const age = new Date(diff).getUTCFullYear() - 1970;
    return age;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading patients...
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Patients</h1>

        <div className="flex items-center gap-3 mt-3 md:mt-0">
          <input
            type="text"
            placeholder="Search by name or email"
            className="border px-3 py-2 rounded-md w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="border px-3 py-2 rounded-md"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
          </select>
          <button
            onClick={() => setView(view === "grid" ? "list" : "grid")}
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            {view === "grid" ? "List View" : "Grid View"}
          </button>
        </div>
      </div>

      {/* Patients List */}
      {filteredPatients.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">No patients found</div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((p) => (
            <div
              key={p.id}
              className="border rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <h2 className="text-lg font-semibold mb-2">{p.name}</h2>
              <p className="text-gray-600 text-sm mb-1">Email: {p.email}</p>
              <p className="text-gray-600 text-sm mb-1">Phone: {p.phone}</p>
              <p className="text-gray-600 text-sm mb-1">Gender: {p.gender}</p>
              <p className="text-gray-600 text-sm mb-1">Age: {p.age}</p>
              <p className="text-gray-500 text-xs mt-2">
                Source: {p.source || "Not specified"}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <table className="w-full border-collapse border border-gray-300 text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-3">Name</th>
              <th className="border p-3">Email</th>
              <th className="border p-3">Phone</th>
              <th className="border p-3">Gender</th>
              <th className="border p-3">Age</th>
              <th className="border p-3">Source</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((p) => (
              <tr key={p.id}>
                <td className="border p-3">{p.name}</td>
                <td className="border p-3">{p.email}</td>
                <td className="border p-3">{p.phone}</td>
                <td className="border p-3">{p.gender}</td>
                <td className="border p-3">{p.age}</td>
                <td className="border p-3">{p.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
