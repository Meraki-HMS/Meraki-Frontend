"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  BedDouble,
  User,
  Calendar,
  Stethoscope,
  X,
  Mail,
  Phone,
  Home,
  IdCard,
  Heart,
} from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_DOCTOR_API_BASE;

export default function AdmittedPatientsPage() {
  const [patients, setPatients] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // For modal

  // Fetch doctor & hospital from localStorage
  const doctor =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("hmsUser"))
      : null;

  const doctorId = doctor?.doctorid;
  const hospitalId = doctor?.hospitalId;

  // Fetch admitted patients
  const loadPatients = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/api/admissions/doctor-patients`,
        {
          params: { hospitalId, doctorId },
        }
      );
      setPatients(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error("Failed to load patients:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (doctorId && hospitalId) loadPatients();
  }, [doctorId, hospitalId]);

  // Search filter
  const handleSearch = (value) => {
    setSearch(value);
    const s = value.toLowerCase();
    setFiltered(
      patients.filter((p) => (p?.fullName || "").toLowerCase().includes(s))
    );
  };

  return (
    <div className="p-6">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <BedDouble className="text-blue-600" />
        Admitted Patients
      </h1>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search patient by name..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 
          focus:ring-blue-500 focus:outline-none shadow-sm"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <p className="text-gray-600 text-center mt-10">Loading patients...</p>
      )}

      {/* No Data */}
      {!loading && filtered.length === 0 && (
        <p className="text-gray-600 text-center mt-10">
          No admitted patients found.
        </p>
      )}

      {/* Patient Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {!loading &&
          filtered.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="bg-white rounded-2xl shadow-lg p-5 border hover:shadow-xl 
              transition-all cursor-pointer"
              onClick={() => setSelected(item)}
            >
              <div className="flex items-center gap-3 mb-3">
                <User className="text-blue-600" size={28} />
                <h2 className="text-xl font-semibold text-gray-900">
                  {item.fullName}
                </h2>
              </div>

              <div className="space-y-2 text-gray-700 text-sm">
                <p className="flex items-center gap-2">
                  <BedDouble size={18} className="text-green-600" />
                  <span className="font-medium">Bed:</span> {item.bedNumber}
                </p>

                <p className="flex items-center gap-2">
                  <Stethoscope size={18} className="text-purple-600" />
                  <span className="font-medium">Department:</span>{" "}
                  {item.department}
                </p>

                <p className="flex items-center gap-2">
                  <Calendar size={18} className="text-red-500" />
                  <span className="font-medium">Admitted:</span>
                  {new Date(item.admissionDateTime).toLocaleString()}
                </p>
              </div>
            </motion.div>
          ))}
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-md flex justify-center items-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white w-full max-w-2xl rounded-2xl p-6 shadow-xl overflow-y-auto max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  Patient Details
                </h2>
                <X
                  className="cursor-pointer"
                  onClick={() => setSelected(null)}
                />
              </div>

              {/* Full Details */}
              <div className="space-y-4 text-gray-700">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <User /> {selected.fullName}
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <p className="flex items-center gap-2">
                    <Mail className="text-blue-600" /> {selected.email}
                  </p>

                  <p className="flex items-center gap-2">
                    <Phone className="text-green-600" />{" "}
                    {selected.contactNumber}
                  </p>

                  <p className="flex items-center gap-2">
                    <Home className="text-purple-600" />{" "}
                    {selected.currentAddress}
                  </p>

                  <p className="flex items-center gap-2">
                    <IdCard className="text-orange-500" />{" "}
                    {selected.patientType}
                  </p>

                  <p className="flex items-center gap-2">
                    <BedDouble className="text-green-600" /> Bed:{" "}
                    {selected.bedNumber}
                  </p>

                  <p className="flex items-center gap-2">
                    <Stethoscope className="text-blue-700" /> Department:{" "}
                    {selected.department}
                  </p>

                  <p className="flex items-center gap-2">
                    <Calendar className="text-red-500" />
                    Admission:{" "}
                    {new Date(selected.admissionDateTime).toLocaleString()}
                  </p>

                  <p className="flex items-center gap-2">
                    <Heart className="text-pink-600" /> Gender:{" "}
                    {selected.gender}
                  </p>
                </div>

                {/* Medical History */}
                <div className="mt-6">
                  <h3 className="text-xl font-semibold mb-3">
                    Medical Information
                  </h3>

                  <p>
                    <strong>Past Medical History:</strong>{" "}
                    {selected.pastMedicalHistory?.join(", ") || "None"}
                  </p>
                  <p>
                    <strong>Past Surgical History:</strong>{" "}
                    {selected.pastSurgicalHistory?.join(", ") || "None"}
                  </p>
                  <p>
                    <strong>Allergies:</strong>{" "}
                    {selected.allergies?.join(", ") || "None"}
                  </p>
                  <p>
                    <strong>Medications:</strong>{" "}
                    {selected.currentMedications?.join(", ") || "None"}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
