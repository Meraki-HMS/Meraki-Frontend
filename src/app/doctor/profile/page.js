"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_DOCTOR_API_BASE || "http://localhost:3000";

export default function DoctorProfilePage() {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [uploading, setUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDocumentSelector, setShowDocumentSelector] = useState(false);

  const [formData, setFormData] = useState({
    languagesSpoken: [],
    qualifications: [],
    hospitalAffiliations: [],
    consultationFee: "",
    emergencyContact: "",
    licenseExpiryDate: "",
    isVerified: false,
    workingHours: { start: "", end: "" },
    breaks: [],
    holidays: [],
    aadhaarCardImage: "",
    panCardImage: "",
    customDocumentName: "",
  });

  // ✅ Fetch doctor profile
  const fetchDoctorProfile = async () => {
    try {
      const hmsUser = JSON.parse(localStorage.getItem("hmsUser"));
      const token = hmsUser?.token;

      if (!token) {
        console.error("❌ No token found. Please log in again.");
        setLoading(false);
        return;
      }

      const res = await axios.get(`${API_BASE_URL}/doctors/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("🩺 Doctor Profile API Response:", res.data);
      setDoctor(res.data.doctor);

      // Prefill modal form with existing data
      setFormData({
        languagesSpoken: res.data.doctor.languagesSpoken || [],
        qualifications: res.data.doctor.qualifications || [],
        hospitalAffiliations: res.data.doctor.hospitalAffiliations || [],
        consultationFee: res.data.doctor.consultationFee || "",
        emergencyContact: res.data.doctor.emergencyContact || "",
        licenseExpiryDate: res.data.doctor.licenseExpiryDate || "",
        isVerified: res.data.doctor.isVerified || false,
        workingHours: res.data.doctor.workingHours || { start: "", end: "" },
        breaks: res.data.doctor.breaks || [],
        holidays: res.data.doctor.holidays || [],
        aadhaarCardImage: res.data.doctor.aadhaarCardImage || "",
        panCardImage: res.data.doctor.panCardImage || "",
      });
    } catch (err) {
      console.error("🚨 Error fetching doctor profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorProfile();
  }, []);

  // ✅ Helper to get auth header
  const getAuthHeader = () => {
    const hmsUser = JSON.parse(localStorage.getItem("hmsUser"));
    return { Authorization: `Bearer ${hmsUser?.token}` };
  };

  // ✅ Update Doctor Profile
  const handleProfileUpdate = async () => {
    try {
      setUploading(true);
      const res = await axios.put(
        `${API_BASE_URL}/doctors/${doctor._id}/profile`,
        formData,
        { headers: { ...getAuthHeader(), "Content-Type": "application/json" } }
      );
      alert("✅ Profile updated successfully!");
      setIsModalOpen(false);
      fetchDoctorProfile();
    } catch (err) {
      console.error("❌ Error updating profile:", err);
      alert("Error updating profile!");
    } finally {
      setUploading(false);
    }
  };

  // ✅ Upload Profile Image
  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("image", file);
      fd.append("doctor_id", doctor._id);

      await axios.post(`${API_BASE_URL}/doctors/profile/upload-profile`, fd, {
        headers: { ...getAuthHeader(), "Content-Type": "multipart/form-data" },
      });
      alert("✅ Profile image uploaded!");
      fetchDoctorProfile();
    } catch (err) {
      console.error("❌ Error uploading image:", err);
      alert("Error uploading profile image!");
    } finally {
      setUploading(false);
    }
  };

  // ✅ Upload Document
  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const documentType = formData.document_type;
    if (!documentType) {
      alert("⚠️ Please select a document type before uploading!");
      return;
    }

    try {
      setUploading(true);

      const fd = new FormData();
      fd.append("document", file);
      fd.append("doctor_id", doctor._id);
      fd.append(
        "document_type",
        documentType === "Other" ? formData.customDocumentName : documentType
      );
      // ✅ same as backend expects

      const res = await axios.post(
        `${API_BASE_URL}/doctors/profile/upload-document`,
        fd,
        {
          headers: {
            ...getAuthHeader(),
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert(`✅ ${documentType} uploaded successfully!`);

      setShowDocumentSelector(false); // 🔥 Hide dropdown
      setFormData({
        // 🔥 Reset fields
        ...formData,
        document_type: "",
        customDocumentName: "",
      });

      fetchDoctorProfile();
    } catch (err) {
      console.error("❌ Error uploading document:", err);
      alert("Error uploading document!");
    } finally {
      setUploading(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading doctor profile...
      </div>
    );

  if (!doctor)
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Doctor profile not found.
      </div>
    );

  const {
    name,
    email,
    specialization,
    contact,
    workingHours,
    slotSize,
    isAvailable,
    hospital_id,
    qualifications,
    hospitalAffiliations,
    languagesSpoken,
    documents,
    breaks,
    holidays,
    createdAt,
    isVerified,
  } = doctor;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "professional", label: "Professional Info" },
    { id: "schedule", label: "Schedule" },
    { id: "documents", label: "Documents" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center sm:justify-between mb-6 border-b pb-4 gap-4">
          <div className="flex items-center gap-4">
            <img
              src={doctor?.profileImage || "/default-doctor.png"}
              alt="Doctor Profile"
              className="w-28 h-28 rounded-full object-cover border-4 border-blue-100 shadow-md"
              onError={(e) => (e.target.src = "/default-doctor.png")}
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {doctor?.name || "Doctor Profile"}
              </h1>
              <p className="text-gray-500">
                {doctor?.specialization || "Specialization not set"}
              </p>
              <p className="text-sm text-gray-400">{doctor?.email}</p>
            </div>
          </div>

          <div className="space-x-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                isAvailable
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {isAvailable ? "Available" : "Unavailable"}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                isVerified
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {isVerified ? "Verified" : "Not Verified"}
            </span>
          </div>
        </div>

        {/* ✅ Action Buttons */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Update Profile Info
          </button>

          <label className="cursor-pointer bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            Upload Profile Image
            <input
              type="file"
              onChange={handleProfileImageUpload}
              className="hidden"
            />
          </label>

          <div className="flex flex-wrap items-center gap-4">
            {/* Upload Document main button */}
            <button
              type="button"
              onClick={() => setShowDocumentSelector(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Upload Document
            </button>

            {/* Show dropdown + custom name + file button only when selecting */}
            {showDocumentSelector && (
              <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 border rounded-lg w-full">
                {/* Dropdown */}
                <select
                  id="documentType"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400"
                  value={formData.document_type || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      document_type: e.target.value,
                      customDocumentName: "",
                    })
                  }
                >
                  <option value="">Select Document Type</option>
                  <option value="AadhaarCard">Aadhaar Card</option>
                  <option value="PANCard">PAN Card</option>
                  <option value="MedicalLicense">Medical License</option>
                  <option value="DegreeCertificate">Degree Certificate</option>
                  <option value="ExperienceLetter">Experience Letter</option>
                  <option value="Other">Other</option>
                </select>

                {/* Custom Document Name input */}
                {formData.document_type === "Other" && (
                  <input
                    type="text"
                    placeholder="Enter Document Name"
                    value={formData.customDocumentName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customDocumentName: e.target.value,
                      })
                    }
                    className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400"
                  />
                )}

                {/* File Upload Button */}
                <label className="cursor-pointer bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                  Select File
                  <input
                    type="file"
                    onChange={handleDocumentUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-all duration-300 ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-blue-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Info label="Name" value={name} />
              <Info label="Email" value={email} />
              <Info label="Specialization" value={specialization} />
              <Info label="Contact" value={contact} />
              <Info label="Hospital ID" value={hospital_id} />
              <Info label="Slot Duration" value={`${slotSize} mins`} />
              <Info label="Status" value={doctor.status} />
            </div>
          )}

          {activeTab === "professional" && (
            <div className="space-y-4">
              <Info
                label="Qualifications"
                value={qualifications?.join(", ") || "Not provided"}
              />
              <Info
                label="Hospital Affiliations"
                value={
                  hospitalAffiliations?.length
                    ? hospitalAffiliations.join(", ")
                    : "Not affiliated"
                }
              />
              <Info
                label="Languages Spoken"
                value={
                  languagesSpoken?.length
                    ? languagesSpoken.join(", ")
                    : "Not specified"
                }
              />
            </div>
          )}

          {activeTab === "schedule" && (
            <div className="space-y-6">
              <Section title="🕐 Working Hours">
                {workingHours ? (
                  <p className="text-gray-800">
                    <strong>Start:</strong> {workingHours.start} |{" "}
                    <strong>End:</strong> {workingHours.end}
                  </p>
                ) : (
                  <p className="text-gray-500 italic">Not specified</p>
                )}
              </Section>

              <Section title="☕ Break Timings">
                {breaks?.length ? (
                  <ul className="space-y-2">
                    {breaks.map((b, i) => (
                      <li
                        key={i}
                        className="flex justify-between bg-gray-50 p-3 rounded-lg border text-gray-800"
                      >
                        <span>From: {b.start}</span>
                        <span>To: {b.end}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">No breaks defined</p>
                )}
              </Section>

              <Section title="🏖 Holidays">
                {holidays?.length ? (
                  <ul className="list-disc ml-6 text-gray-800">
                    {holidays.map((h, i) => (
                      <li key={i}>{new Date(h).toLocaleDateString("en-IN")}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">No holidays listed</p>
                )}
              </Section>
            </div>
          )}

          {activeTab === "documents" && (
            <div>
              {documents?.length ? (
                <ul className="space-y-3">
                  {documents.map((doc, i) => (
                    <li
                      key={i}
                      className="flex justify-between items-center p-3 border rounded-lg bg-gray-50"
                    >
                      <div>
                        <p className="font-medium text-gray-800">{doc.name}</p>
                        <p className="text-sm text-gray-500">
                          Uploaded:{" "}
                          {new Date(doc.uploadedAt).toLocaleString("en-IN")}
                        </p>
                      </div>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No documents uploaded</p>
              )}
            </div>
          )}
        </div>

        {/* Created At */}
        <div className="mt-10 text-sm text-gray-500 text-right border-t pt-3">
          Profile Created:{" "}
          {new Date(createdAt).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </div>
      </div>

      {/* ✅ Modal */}
      <EditProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formData={formData}
        setFormData={setFormData}
        onSave={handleProfileUpdate}
        uploading={uploading}
      />
    </div>
  );
}

// ✅ Reusable Components
function Info({ label, value }) {
  return (
    <div>
      <h3 className="text-gray-500 text-sm">{label}</h3>
      <p className="text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-gray-700 text-lg font-semibold border-b pb-2 mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

// ✅ Modal Component
function EditProfileModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSave,
  uploading,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Edit Profile Info
        </h2>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {/* Existing fields */}
          <InputField
            label="Languages Spoken"
            placeholder="English, Hindi"
            value={formData.languagesSpoken.join(", ")}
            onChange={(e) =>
              setFormData({
                ...formData,
                languagesSpoken: e.target.value.split(",").map((x) => x.trim()),
              })
            }
          />

          <InputField
            label="Qualifications"
            placeholder="MBBS, MD"
            value={formData.qualifications.join(", ")}
            onChange={(e) =>
              setFormData({
                ...formData,
                qualifications: e.target.value.split(",").map((x) => x.trim()),
              })
            }
          />

          <InputField
            label="Hospital Affiliations"
            placeholder="Apollo Hospital, City Care"
            value={formData.hospitalAffiliations.join(", ")}
            onChange={(e) =>
              setFormData({
                ...formData,
                hospitalAffiliations: e.target.value
                  .split(",")
                  .map((x) => x.trim()),
              })
            }
          />

          <InputField
            label="Consultation Fee (₹)"
            type="number"
            value={formData.consultationFee}
            onChange={(e) =>
              setFormData({ ...formData, consultationFee: e.target.value })
            }
          />

          <InputField
            label="Emergency Contact"
            placeholder="9876543210"
            value={formData.emergencyContact}
            onChange={(e) =>
              setFormData({ ...formData, emergencyContact: e.target.value })
            }
          />

          {/* ✅ License Expiry */}
          <InputField
            label="License Expiry Date"
            type="date"
            value={
              formData.licenseExpiryDate
                ? formData.licenseExpiryDate.substring(0, 10)
                : ""
            }
            onChange={(e) =>
              setFormData({ ...formData, licenseExpiryDate: e.target.value })
            }
          />

          {/* ✅ Verified toggle */}
          <div className="flex items-center gap-3">
            <label className="text-gray-700">Verified:</label>
            <input
              type="checkbox"
              checked={formData.isVerified}
              onChange={(e) =>
                setFormData({ ...formData, isVerified: e.target.checked })
              }
              className="w-5 h-5 accent-blue-600"
            />
          </div>

          {/* ✅ Working Hours */}
          <div>
            <label className="block text-gray-700 mb-1">Working Hours</label>
            <div className="flex gap-2">
              <input
                type="time"
                value={formData.workingHours.start}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    workingHours: {
                      ...formData.workingHours,
                      start: e.target.value,
                    },
                  })
                }
                className="border rounded-lg px-3 py-2 w-full"
              />
              <input
                type="time"
                value={formData.workingHours.end}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    workingHours: {
                      ...formData.workingHours,
                      end: e.target.value,
                    },
                  })
                }
                className="border rounded-lg px-3 py-2 w-full"
              />
            </div>
          </div>

          {/* ✅ Breaks */}
          <div>
            <label className="block text-gray-700 mb-1">Break Timings</label>
            {formData.breaks.map((b, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  type="time"
                  value={b.start}
                  onChange={(e) => {
                    const updated = [...formData.breaks];
                    updated[i].start = e.target.value;
                    setFormData({ ...formData, breaks: updated });
                  }}
                  className="border rounded-lg px-3 py-2 w-full"
                />
                <input
                  type="time"
                  value={b.end}
                  onChange={(e) => {
                    const updated = [...formData.breaks];
                    updated[i].end = e.target.value;
                    setFormData({ ...formData, breaks: updated });
                  }}
                  className="border rounded-lg px-3 py-2 w-full"
                />
              </div>
            ))}
            <button
              type="button"
              className="text-blue-600 text-sm"
              onClick={() =>
                setFormData({
                  ...formData,
                  breaks: [...formData.breaks, { start: "", end: "" }],
                })
              }
            >
              + Add Break
            </button>
          </div>

          {/* ✅ Holidays */}
          <div>
            <label className="block text-gray-700 mb-1">Holidays</label>
            {formData.holidays.map((h, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  type="date"
                  value={h.substring(0, 10)}
                  onChange={(e) => {
                    const updated = [...formData.holidays];
                    updated[i] = e.target.value;
                    setFormData({ ...formData, holidays: updated });
                  }}
                  className="border rounded-lg px-3 py-2 w-full"
                />
              </div>
            ))}
            <button
              type="button"
              className="text-blue-600 text-sm"
              onClick={() =>
                setFormData({
                  ...formData,
                  holidays: [...formData.holidays, ""],
                })
              }
            >
              + Add Holiday
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="block text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border rounded-lg px-3 py-2"
      />
    </div>
  );
}
