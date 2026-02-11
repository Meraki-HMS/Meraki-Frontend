"use client";

import { useState } from "react";
import { useLabAuth } from "../../../hooks/useLabAuth";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircle,
  FileUp,
  X,
  User,
  Mail,
  Phone,
  FlaskConical,
} from "lucide-react";
import axios from "axios";

const API_BASE =
  process.env.NEXT_PUBLIC_LAB_API_BASE || "http://localhost:3000";

export default function LabDashboard() {
  const { user } = useLabAuth();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const commonTests = [
    "Complete Blood Count (CBC)",
    "Blood Sugar Test",
    "Liver Function Test (LFT)",
    "Kidney Function Test (KFT)",
    "Lipid Profile",
    "Thyroid Profile",
    "Urine Routine Test",
    "X-Ray",
    "MRI Scan",
    "CT Scan",
  ];

  const [formData, setFormData] = useState({
    patientName: "",
    patientEmail: "",
    patientContact: "",
    selectedTest: "",
    customTest: "",
    remarks: "",
    reportFile: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "reportFile") {
      setFormData({ ...formData, reportFile: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   try {
  //     const token = JSON.parse(localStorage.getItem("hmsUser"))?.token;
  //     const hmsUser = JSON.parse(localStorage.getItem("hmsUser"));

  //     const finalTestName =
  //       formData.selectedTest === "Other"
  //         ? formData.customTest
  //         : formData.selectedTest;

  //     const fd = new FormData();

  //     fd.append("patientName", formData.patientName);
  //     fd.append("patientEmail", formData.patientEmail);
  //     fd.append("patientContact", formData.patientContact);
  //     fd.append("testName", finalTestName);
  //     fd.append("remarks", formData.remarks);

  //     // 🔥 VERY IMPORTANT
  //     fd.append("hospital_id", hmsUser.hospitalId);
  //     fd.append("lab_id", hmsUser.labid);

  //     fd.append("reportFile", formData.reportFile); // must match multer

  //     await axios.post(`${API_BASE}/lab-reports/create`, fd, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     alert("Lab Report Uploaded Successfully!");
  //     setShowForm(false);
  //   } catch (error) {
  //     console.error("Upload Error:", error);
  //     alert("Upload failed");
  //   }
  // };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const hmsUser = JSON.parse(localStorage.getItem("hmsUser"));
      const token = hmsUser?.token;

      if (!token) {
        alert("Session expired. Please login again.");
        return;
      }

      const finalTestName =
        formData.selectedTest === "Other"
          ? formData.customTest
          : formData.selectedTest;

      const fd = new FormData();

      fd.append("patientName", formData.patientName);
      fd.append("patientEmail", formData.patientEmail);
      fd.append("patientContact", formData.patientContact);
      fd.append("testName", finalTestName);
      fd.append("remarks", formData.remarks);

      // Important: match backend keys
      fd.append("hospital_id", hmsUser.hospitalId);
      fd.append("lab_id", hmsUser.labid);

      fd.append("reportFile", formData.reportFile);

      await axios.post(`${API_BASE}/lab-reports/create`, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Lab Report Uploaded Successfully!");

      // ✅ Reset form completely
      setFormData({
        patientName: "",
        patientEmail: "",
        patientContact: "",
        selectedTest: "",
        customTest: "",
        remarks: "",
        reportFile: null,
      });

      // ✅ Close modal
      setShowForm(false);
    } catch (error) {
      console.error("Upload Error:", error.response?.data || error);
      alert(error.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold">
          Welcome back {user?.email?.split("@")[0] || "Lab User"}
        </h1>
        <p className="opacity-90 mt-2">
          Upload and manage patient lab reports easily.
        </p>
      </div>

      {/* Action Card */}
      <div className="bg-white rounded-2xl shadow-md p-6 flex justify-between items-center border">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Add New Lab Report
          </h2>
          <p className="text-gray-500 text-sm">
            Upload patient test results securely
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-purple-600 text-white px-5 py-3 rounded-xl hover:bg-purple-700 transition shadow"
        >
          <PlusCircle size={18} />
          Add Report
        </button>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowForm(false)}
                className="absolute top-5 right-5 text-gray-400 hover:text-red-500"
              >
                <X size={20} />
              </button>

              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Add Lab Report
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <InputField
                  icon={<User size={18} />}
                  name="patientName"
                  placeholder="Patient Name"
                  value={formData.patientName}
                  onChange={handleChange}
                  required
                />

                <InputField
                  icon={<Mail size={18} />}
                  name="patientEmail"
                  placeholder="Patient Email"
                  value={formData.patientEmail}
                  onChange={handleChange}
                  type="email"
                />

                <InputField
                  icon={<Phone size={18} />}
                  name="patientContact"
                  placeholder="Patient Contact"
                  value={formData.patientContact}
                  onChange={handleChange}
                />

                <div className="relative">
                  <FlaskConical
                    className="absolute left-3 top-3 text-gray-400"
                    size={18}
                  />
                  <select
                    name="selectedTest"
                    value={formData.selectedTest}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                    required
                  >
                    <option value="">Select Test</option>
                    {commonTests.map((test, i) => (
                      <option key={i} value={test}>
                        {test}
                      </option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                </div>

                {formData.selectedTest === "Other" && (
                  <InputField
                    name="customTest"
                    placeholder="Enter Custom Test Name"
                    value={formData.customTest}
                    onChange={handleChange}
                    required
                  />
                )}

                <div className="border-2 border-dashed rounded-xl p-6 text-center hover:border-purple-500 transition">
                  <FileUp className="mx-auto text-purple-600 mb-3" size={28} />
                  <p className="text-gray-600 mb-2">
                    Upload Lab Report (Any Format)
                  </p>
                  <input
                    type="file"
                    name="reportFile"
                    onChange={handleChange}
                    className="w-full"
                    required
                  />
                </div>

                <textarea
                  name="remarks"
                  placeholder="Additional Remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  rows={3}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition shadow-md disabled:opacity-50"
                >
                  {loading ? "Uploading..." : "Submit Lab Report"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InputField({ icon, ...props }) {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-3 text-gray-400">{icon}</div>
      )}
      <input
        {...props}
        className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
      />
    </div>
  );
}
