"use client";

import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function BedManagementPage() {
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [hospitalId, setHospitalId] = useState(null);

  const [assignModal, setAssignModal] = useState(false);
  const [selectedBed, setSelectedBed] = useState(null);
  const [patients, setPatients] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [patientInfo, setPatientInfo] = useState(null);
  const [patientModal, setPatientModal] = useState(false);
  const [loadingPatient, setLoadingPatient] = useState(false);

  const [assignForm, setAssignForm] = useState({
    patient_id: "",
    nurse_id: "",
  });

  // ✅ Removed bed_type completely
  const [form, setForm] = useState({
    bed_id: "",
    ward: "General",
    price_per_day: "",
  });

  /* ---------------- FILTER STATES ---------------- */

  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [wardFilter, setWardFilter] = useState("all");
  const [search, setSearch] = useState("");

  const API_BASE =
    process.env.NEXT_PUBLIC_ADMIN_API_BASE || "http://localhost:3000";

  /* ---------------- LOAD HOSPITAL ID ---------------- */

  useEffect(() => {
    const id = localStorage.getItem("hospitalId");
    if (id) setHospitalId(id);
  }, []);

  useEffect(() => {
    if (!assignModal || !hospitalId) return;

    const fetchData = async () => {
      try {
        const [patientsRes, nursesRes] = await Promise.all([
          axios.get(`${API_BASE}/AssignBed/hospital/admitted`, {
            params: { hospitalId },
          }),
          axios.get(`${API_BASE}/AssignBed/hospital/nurses`, {
            params: { hospitalId },
          }),
        ]);

        setPatients(patientsRes.data.patients || []);
        setNurses(nursesRes.data.nurses || []);
      } catch (err) {
        console.error("Error loading assign data:", err);
      }
    };

    fetchData();
  }, [assignModal, hospitalId]);

  /* ---------------- FETCH BEDS ---------------- */

  const fetchBeds = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/beds/${hospitalId}`);
      setBeds(res.data);
    } catch (err) {
      console.error("Error fetching beds:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hospitalId) fetchBeds();
  }, [hospitalId]);

  /* ---------------- FILTERED DATA ---------------- */

  const filteredBeds = useMemo(() => {
    return beds.filter((bed) => {
      if (availabilityFilter === "available" && bed.is_occupied) return false;
      if (availabilityFilter === "occupied" && !bed.is_occupied) return false;

      if (wardFilter !== "all" && bed.ward !== wardFilter) return false;

      if (search && !bed.bed_id.toLowerCase().includes(search.toLowerCase()))
        return false;

      return true;
    });
  }, [beds, availabilityFilter, wardFilter, search]);

  const uniqueWards = [...new Set(beds.map((b) => b.ward))];

  /* ---------------- ADD BED ---------------- */

  const handleAddBed = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API_BASE}/beds/add`, {
        ...form,
        hospital_id: hospitalId,
      });

      setShowModal(false);
      setForm({
        bed_id: "",
        ward: "General",
        price_per_day: "",
      });

      fetchBeds();
    } catch (err) {
      alert(err.response?.data?.message || "Error adding bed");
    }
  };

  /* ---------------- DELETE BED ---------------- */

  const handleDelete = async (bed_id) => {
    if (!confirm("Delete this bed?")) return;

    try {
      await axios.delete(`${API_BASE}/beds/${hospitalId}/${bed_id}`);
      fetchBeds();
    } catch (err) {
      alert(err.response?.data?.message || "Cannot delete bed");
    }
  };

  /* ---------------- ASSIGN BED ---------------- */

  const handleAssign = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API_BASE}/AssignBed/assign`, {
        ...assignForm,
        bed_id: selectedBed.bed_id,
      });

      setAssignModal(false);
      setAssignForm({ patient_id: "", nurse_id: "" });
      fetchBeds();
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  const handleViewPatient = async (bedId) => {
    try {
      setLoadingPatient(true);
      const res = await axios.get(`${API_BASE}/AssignBed/bed/${bedId}`);

      setPatientInfo(res.data.patient);
      setPatientModal(true);
    } catch (err) {
      alert(err.response?.data?.message || "No patient found");
    } finally {
      setLoadingPatient(false);
    }
  };

  /* ---------------- RELEASE BED ---------------- */

  const handleRelease = async (bed_id) => {
    try {
      const res = axios.post(`${API_BASE}/AssignBed/release/${assignment._id}`);

      const assignment = res.data.find(
        (a) => a.bed_id?.toString() === bed_id.toString() && !a.discharge_date,
      );

      if (!assignment) {
        alert("No active assignment found for this bed");
        return;
      }

      await axios.put(`${API_BASE}/assignments/release/${assignment._id}`);

      fetchBeds();
    } catch (err) {
      alert(err.response?.data?.message || "Release failed");
    }
  };

  const handleDischarge = async (bedId) => {
    try {
      const res = await axios.post(
        `${API_BASE}/discharge/generate-by-bed/${bedId}`,
      );

      const summary = res.data.dischargeSummary;

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      /* ================= HEADER ================= */

      // Header Background
      doc.setFillColor(25, 118, 210); // Blue
      doc.rect(0, 0, pageWidth, 35, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text(summary.hospital.name.toUpperCase(), pageWidth / 2, 18, {
        align: "center",
      });

      doc.setFontSize(12);
      doc.text("Discharge Bill / Invoice", pageWidth / 2, 27, {
        align: "center",
      });

      doc.setTextColor(0, 0, 0);

      /* ================= PATIENT INFO BOX ================= */

      doc.setDrawColor(200);
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(10, 45, pageWidth - 20, 45, 3, 3, "FD");

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Patient Details", 15, 55);

      doc.setFont("helvetica", "normal");

      doc.text(`Patient Name: ${summary.patient.fullName}`, 15, 65);
      doc.text(`Admission No: ${summary.patient.admissionNumber}`, 15, 72);
      doc.text(`Ward Type: ${summary.patient.wardType}`, 15, 79);

      doc.text(
        `Admission Date: ${new Date(
          summary.bedDetails.assignedDate,
        ).toLocaleDateString()}`,
        120,
        65,
      );

      doc.text(
        `Discharge Date: ${new Date(
          summary.bedDetails.dischargeDate,
        ).toLocaleDateString()}`,
        120,
        72,
      );

      /* ================= BILL TABLE ================= */

      let startY = 105;

      // Table Header Background
      doc.setFillColor(25, 118, 210);
      doc.rect(10, startY, pageWidth - 20, 10, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text("Description", 15, startY + 7);
      doc.text("Days", 110, startY + 7);
      doc.text("Rate (₹)", 130, startY + 7);
      doc.text("Amount (₹)", 160, startY + 7);

      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");

      startY += 15;

      const days = 1;
      const rate = summary.bedDetails.rate || summary.bedDetails.totalCost;
      const total = summary.bedDetails.totalCost;

      // Table Row
      doc.rect(10, startY - 7, pageWidth - 20, 12);
      doc.text("Bed Charges", 15, startY);
      doc.text(String(days), 112, startY);
      doc.text(String(rate), 132, startY);
      doc.text(String(total), 165, startY);

      startY += 20;

      /* ================= GRAND TOTAL BOX ================= */

      doc.setFillColor(230, 247, 255);
      doc.roundedRect(pageWidth - 90, startY, 80, 20, 3, 3, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Grand Total", pageWidth - 80, startY + 8);

      doc.setFontSize(16);
      doc.text(`₹ ${total}`, pageWidth - 80, startY + 16);

      /* ================= FOOTER ================= */

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        "This is a computer generated invoice. No signature required.",
        pageWidth / 2,
        260,
        { align: "center" },
      );

      doc.text(
        "Thank you for choosing our hospital. Wishing you good health!",
        pageWidth / 2,
        268,
        { align: "center" },
      );

      doc.save(`${summary.patient.fullName}_Discharge_Bill.pdf`);

      fetchBeds();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Discharge failed");
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Bed Management</h1>
          <p className="text-gray-500 mt-1">Manage hospital beds efficiently</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
        >
          <i className="bi bi-plus-lg mr-2"></i>
          Add Bed
        </button>
      </div>

      {/* FILTER BAR (UNCHANGED) */}
      <div className="bg-white p-5 rounded-2xl shadow border mb-8 grid md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Search Bed ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-4 py-2 rounded-lg"
        />

        <select
          value={availabilityFilter}
          onChange={(e) => setAvailabilityFilter(e.target.value)}
          className="border px-4 py-2 rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
        </select>

        <select
          value={wardFilter}
          onChange={(e) => setWardFilter(e.target.value)}
          className="border px-4 py-2 rounded-lg"
        >
          <option value="all">All Wards</option>
          {uniqueWards.map((ward) => (
            <option key={ward} value={ward}>
              {ward}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            setAvailabilityFilter("all");
            setWardFilter("all");
            setSearch("");
          }}
          className="bg-gray-100 hover:bg-gray-200 rounded-lg"
        >
          Reset Filters
        </button>
      </div>

      {/* BEDS GRID */}
      {/* BEDS TABLE */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-50 border-b sticky top-0 z-10">
                <tr className="text-gray-600 uppercase text-xs tracking-wider">
                  <th className="px-6 py-4">Bed ID</th>
                  <th className="px-6 py-4">Ward</th>
                  <th className="px-6 py-4">Price / Day</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {filteredBeds.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-6 text-center text-gray-500"
                    >
                      No beds found
                    </td>
                  </tr>
                ) : (
                  filteredBeds.map((bed, index) => (
                    <motion.tr
                      key={bed.bed_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-gray-50 even:bg-gray-50/40 transition"
                    >
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        {bed.bed_id}
                      </td>

                      <td className="px-6 py-4 text-gray-600">{bed.ward}</td>

                      <td className="px-6 py-4 text-gray-600">
                        ₹ {bed.price_per_day}
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${
                            bed.is_occupied
                              ? "bg-red-100 text-red-700 border border-red-200"
                              : "bg-green-100 text-green-700 border border-green-200"
                          }`}
                        >
                          {bed.is_occupied ? "Occupied" : "Available"}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          {/* ✅ PATIENT INFO BUTTON */}
                          {bed.is_occupied && (
                            <button
                              onClick={() => handleViewPatient(bed.bed_id)}
                              className="px-4 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                            >
                              Info
                            </button>
                          )}

                          {!bed.is_occupied ? (
                            <button
                              onClick={() => {
                                setSelectedBed(bed);
                                setAssignModal(true);
                              }}
                              className="px-4 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                            >
                              Assign
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDischarge(bed.bed_id)}
                              className="px-4 py-1.5 text-xs bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition"
                            >
                              Discharge
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(bed.bed_id)}
                            className="px-4 py-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* {filteredBeds.map((bed) => (
            <motion.div
              key={bed.bed_id}
              whileHover={{ scale: 1.03 }}
              className="bg-white rounded-2xl shadow border p-5"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-lg text-gray-800">
                  {bed.bed_id}
                </h3>

                <span
                  className={`px-3 py-1 text-xs rounded-full font-medium ${
                    bed.is_occupied
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {bed.is_occupied ? "Occupied" : "Available"}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-1">Ward: {bed.ward}</p>

              <p className="text-gray-600 text-sm mb-4">
                ₹ {bed.price_per_day} / day
              </p>

              <div className="flex gap-2">
                {!bed.is_occupied ? (
                  <button
                    onClick={() => {
                      setSelectedBed(bed);
                      setAssignModal(true);
                    }}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg"
                  >
                    Assign
                  </button>
                ) : (
                  <button
                    onClick={() => handleDischarge(bed.bed_id)}
                    className="flex-1 py-2 bg-yellow-500 text-white rounded-lg"
                  >
                    Discharge
                  </button>
                )}

                <button
                  onClick={() => handleDelete(bed.bed_id)}
                  className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))} }
        </div>
      )}

      {/* ADD BED MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4">Add New Bed</h2>

            <form onSubmit={handleAddBed} className="space-y-4">
              <input
                type="text"
                placeholder="Bed ID"
                value={form.bed_id}
                onChange={(e) => setForm({ ...form, bed_id: e.target.value })}
                className="w-full border px-4 py-2 rounded-lg"
                required
              />

              {/* ✅ Ward Dropdown */}
              <select
                value={form.ward}
                onChange={(e) => setForm({ ...form, ward: e.target.value })}
                className="w-full border px-4 py-2 rounded-lg"
              >
                <option value="General">General</option>
                <option value="Semi Special">Semi Special</option>
                <option value="Special">Special</option>
              </select>

              <input
                type="number"
                placeholder="Price per day"
                value={form.price_per_day}
                onChange={(e) =>
                  setForm({
                    ...form,
                    price_per_day: e.target.value,
                  })
                }
                className="w-full border px-4 py-2 rounded-lg"
                required
              />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Add Bed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ASSIGN BED MODAL */}
      {assignModal && selectedBed && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4">
              Assign Bed - {selectedBed.bed_id}
            </h2>

            <form onSubmit={handleAssign} className="space-y-4">
              {/* Bed ID (Readonly) */}
              <div>
                <label className="block text-sm mb-1">Bed ID</label>
                <input
                  type="text"
                  value={selectedBed.bed_id}
                  disabled
                  className="w-full border px-4 py-2 rounded-lg bg-gray-100"
                />
              </div>

              {/* Patient Dropdown */}
              <div>
                <label className="block text-sm mb-1">Select Patient</label>
                <select
                  value={assignForm.patient_id}
                  onChange={(e) =>
                    setAssignForm({
                      ...assignForm,
                      patient_id: e.target.value,
                    })
                  }
                  className="w-full border px-4 py-2 rounded-lg"
                  required
                >
                  <option value="">Select Patient</option>
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.fullName} (Ward: {p.wardType})
                    </option>
                  ))}
                </select>
              </div>

              {/* Nurse Dropdown */}
              <div>
                <label className="block text-sm mb-1">Select Nurse</label>
                <select
                  value={assignForm.nurse_id}
                  onChange={(e) =>
                    setAssignForm({
                      ...assignForm,
                      nurse_id: e.target.value,
                    })
                  }
                  className="w-full border px-4 py-2 rounded-lg"
                  required
                >
                  <option value="">Select Nurse</option>
                  {nurses.map((n) => (
                    <option key={n._id} value={n._id}>
                      {n.fullName} ({n.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Assign Bed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* PATIENT INFO MODAL */}
      {patientModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-2xl rounded-2xl p-6 shadow-lg overflow-y-auto max-h-[90vh]">
            {loadingPatient ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                  Patient Information
                </h2>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold">Full Name</p>
                    <p className="text-gray-600">{patientInfo?.fullName}</p>
                  </div>

                  <div>
                    <p className="font-semibold">Admission No</p>
                    <p className="text-gray-600">
                      {patientInfo?.admissionNumber}
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold">Age</p>
                    <p className="text-gray-600">{patientInfo?.age}</p>
                  </div>

                  <div>
                    <p className="font-semibold">Gender</p>
                    <p className="text-gray-600">{patientInfo?.gender}</p>
                  </div>

                  <div>
                    <p className="font-semibold">Blood Group</p>
                    <p className="text-gray-600">{patientInfo?.bloodGroup}</p>
                  </div>

                  <div>
                    <p className="font-semibold">Ward Type</p>
                    <p className="text-gray-600">{patientInfo?.wardType}</p>
                  </div>

                  <div className="col-span-2">
                    <p className="font-semibold">Reason</p>
                    <p className="text-gray-600">
                      {patientInfo?.reasonForAdmission}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => {
                      setPatientModal(false);
                      setPatientInfo(null);
                    }}
                    className="px-5 py-2 bg-gray-200 rounded-lg"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
