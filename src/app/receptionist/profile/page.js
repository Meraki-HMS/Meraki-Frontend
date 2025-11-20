"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Tries to extract current user email from localStorage
function getCurrentEmail() {
  const hmsUser = JSON.parse(localStorage.getItem("hmsUser"));
  return hmsUser?.email;
}

export default function ReceptionistProfilePage() {
  const [receptionist, setReceptionist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [uploading, setUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    dateOfBirth: "",
    gender: "",
    aadhaarCardNumber: "",
    panCardNumber: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    emergencyContact: {
      name: "",
      phone: "",
      relation: "",
    },
    designation: "Receptionist",
    qualifications: [],
    experienceYears: "",
    isVerified: false,
    document_type: "",
    customDocumentName: "",
  });

  const fetchReceptionistProfile = async () => {
    try {
      const hmsUser = JSON.parse(localStorage.getItem("hmsUser"));
      const token = hmsUser?.token;

      if (!token) {
        console.error("❌ No token found. Please log in again.");
        setLoading(false);
        return;
      }

      // Decode the JWT token to get receptionist ID
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const receptionistId = decodedToken.id;

      if (!receptionistId) {
        console.error("❌ Could not decode receptionist ID from token.");
        setLoading(false);
        return;
      }

      // Use empty PUT request to get profile data
      const res = await axios.put(
        `${API_BASE_URL}/receptionists/${receptionistId}/profile`,
        {}, // Empty object
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const profileData = res.data.receptionist;
      setReceptionist(profileData);

      // Update form data with proper null/undefined handling
      setFormData({
        name: profileData.name || "",
        email: profileData.email || "",
        mobile: profileData.mobile || "",
        dateOfBirth: profileData.dateOfBirth 
          ? new Date(profileData.dateOfBirth).toISOString().substring(0, 10) 
          : "",
        gender: profileData.gender || "",
        aadhaarCardNumber: profileData.aadhaarCardNumber || "",
        panCardNumber: profileData.panCardNumber || "",
        address: {
          street: profileData.address?.street || "",
          city: profileData.address?.city || "",
          state: profileData.address?.state || "",
          zipCode: profileData.address?.zipCode || "",
          country: profileData.address?.country || "",
        },
        emergencyContact: {
          name: profileData.emergencyContact?.name || "",
          phone: profileData.emergencyContact?.phone || "",
          relation: profileData.emergencyContact?.relation || "",
        },
        designation: profileData.designation || "Receptionist",
        qualifications: Array.isArray(profileData.qualifications) 
          ? profileData.qualifications 
          : [],
        experienceYears: profileData.experienceYears || "",
        isVerified: profileData.isVerified || false,
        document_type: "",
        customDocumentName: "",
      });
    } catch (err) {
      console.error("🚨 Error fetching receptionist profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceptionistProfile();
  }, []);

  // Auth header
  const getAuthHeader = () => {
    const hmsUser = JSON.parse(localStorage.getItem("hmsUser"));
    return { Authorization: `Bearer ${hmsUser?.token}` };
  };

  // Update Receptionist Profile
  const handleProfileUpdate = async () => {
    try {
      setUploading(true);
      
      // Prepare the data for backend
      const updateData = {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        aadhaarCardNumber: formData.aadhaarCardNumber,
        panCardNumber: formData.panCardNumber,
        address: formData.address,
        emergencyContact: formData.emergencyContact,
        designation: formData.designation,
        qualifications: formData.qualifications,
        experienceYears: formData.experienceYears,
        isVerified: formData.isVerified,
      };

      const res = await axios.put(
        `${API_BASE_URL}/receptionists/${receptionist._id}/profile`,
        updateData,
        { headers: { ...getAuthHeader(), "Content-Type": "application/json" } }
      );
      
      alert("✅ Profile updated successfully!");
      setIsModalOpen(false);
      await fetchReceptionistProfile(); // Refresh the profile data
    } catch (err) {
      console.error("❌ Error updating profile:", err);
      alert("Error updating profile!");
    } finally {
      setUploading(false);
    }
  };

  // Upload Profile Image
  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("image", file);
      fd.append("receptionist_id", receptionist._id);

      await axios.post(`${API_BASE_URL}/receptionists/profile/upload-profile`, fd, {
        headers: { ...getAuthHeader(), "Content-Type": "multipart/form-data" },
      });
      alert("✅ Profile image uploaded!");
      await fetchReceptionistProfile();
    } catch (err) {
      console.error("❌ Error uploading image:", err);
      alert("Error uploading profile image!");
    } finally {
      setUploading(false);
    }
  };

  // Upload Document
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
      fd.append("receptionist_id", receptionist._id);
      fd.append(
        "document_type",
        documentType === "Other" ? formData.customDocumentName : documentType
      );

      await axios.post(
        `${API_BASE_URL}/receptionists/profile/upload-document`,
        fd,
        {
          headers: {
            ...getAuthHeader(),
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert(`✅ ${documentType} uploaded successfully!`);
      await fetchReceptionistProfile();
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
        Loading receptionist profile...
      </div>
    );

  if (!receptionist)
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Receptionist profile not found.
      </div>
    );

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "personal", label: "Personal Info" },
    { id: "professional", label: "Professional Info" },
    { id: "documents", label: "Documents" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center sm:justify-between mb-6 border-b pb-4 gap-4">
          <div className="flex items-center gap-4">
            {receptionist.profileImage ? (
              <img
                src={receptionist.profileImage}
                alt="Receptionist Profile"
                className="w-28 h-28 rounded-full object-cover border-4 border-blue-100 shadow-md"
                onError={(e) => (e.target.src = "/default-user.png")}
              />
            ) : (
              <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg border-4 border-blue-100">
                <span className="text-white font-bold text-4xl">
                  {receptionist.name ? receptionist.name.split(" ").map((n) => n[0]).join("").toUpperCase() : "R"}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {receptionist.name || "Receptionist Profile"}
              </h1>
              <p className="text-gray-500">{receptionist.email}</p>
              <p className="text-gray-500">{receptionist.designation || "Receptionist"}</p>
            </div>
          </div>

          <div className="space-x-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                receptionist.status === "active"
                  ? "bg-green-100 text-green-700"
                  : receptionist.status === "inactive"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {(receptionist.status || "Active").charAt(0).toUpperCase() +
                (receptionist.status || "Active").slice(1)}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                receptionist.isVerified
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {receptionist.isVerified ? "Verified" : "Not Verified"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
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
              accept="image/*"
            />
          </label>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Select document type */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <select
                id="documentType"
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 w-full sm:w-auto"
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
                <option value="ExperienceLetter">Experience Letter</option>
                <option value="Other">Other</option>
              </select>

              {/* Show custom name if "Other" */}
              {formData.document_type === "Other" && (
                <input
                  type="text"
                  placeholder="Enter custom document name"
                  value={formData.customDocumentName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customDocumentName: e.target.value,
                    })
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 w-full sm:w-auto"
                />
              )}
            </div>

            {/* Upload document file */}
            <label className="cursor-pointer bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
              Upload Document
              <input
                type="file"
                onChange={handleDocumentUpload}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </label>
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
              <Info label="Name" value={receptionist.name || "Not provided"} />
              <Info label="Email" value={receptionist.email || "Not provided"} />
              <Info label="Mobile" value={receptionist.mobile || "Not provided"} />
              <Info label="Designation" value={receptionist.designation || "Receptionist"} />
              <Info
                label="Status"
                value={
                  (receptionist.status || "Active").charAt(0).toUpperCase() +
                  (receptionist.status || "Active").slice(1)
                }
              />
              <Info 
                label="Hospital ID" 
                value={receptionist.hospital_id || "Not provided"} 
              />
            </div>
          )}

          {activeTab === "personal" && (
            <div className="space-y-4">
              <Info
                label="Date of Birth"
                value={
                  receptionist.dateOfBirth
                    ? new Date(receptionist.dateOfBirth).toLocaleDateString("en-IN")
                    : "Not provided"
                }
              />
              <Info 
                label="Gender" 
                value={receptionist.gender || "Not specified"} 
              />
              <Info
                label="Aadhaar Card Number"
                value={receptionist.aadhaarCardNumber || "Not provided"}
              />
              <Info
                label="PAN Card Number"
                value={receptionist.panCardNumber || "Not provided"}
              />
              <div>
                <h3 className="text-gray-500 text-sm mb-1">Address</h3>
                <p className="text-gray-900">
                  {receptionist.address?.street && `${receptionist.address.street}, `}
                  {receptionist.address?.city && `${receptionist.address.city}, `}
                  {receptionist.address?.state && `${receptionist.address.state} `}
                  {receptionist.address?.zipCode && `${receptionist.address.zipCode}, `}
                  {receptionist.address?.country && `${receptionist.address.country}`}
                  {!receptionist.address?.street && 
                   !receptionist.address?.city && 
                   !receptionist.address?.state && 
                   !receptionist.address?.zipCode && 
                   !receptionist.address?.country && "Not provided"}
                </p>
              </div>
              <div>
                <h3 className="text-gray-500 text-sm mb-1">Emergency Contact</h3>
                <p className="text-gray-900">
                  {receptionist.emergencyContact?.name && `Name: ${receptionist.emergencyContact.name}, `}
                  {receptionist.emergencyContact?.phone && `Phone: ${receptionist.emergencyContact.phone}, `}
                  {receptionist.emergencyContact?.relation && `Relation: ${receptionist.emergencyContact.relation}`}
                  {!receptionist.emergencyContact?.name && 
                   !receptionist.emergencyContact?.phone && 
                   !receptionist.emergencyContact?.relation && "Not provided"}
                </p>
              </div>
            </div>
          )}

          {activeTab === "professional" && (
            <div className="space-y-4">
              <Info
                label="Qualifications"
                value={
                  Array.isArray(receptionist.qualifications) && receptionist.qualifications.length > 0
                    ? receptionist.qualifications.join(", ")
                    : "Not provided"
                }
              />
              <Info
                label="Experience (Years)"
                value={receptionist.experienceYears || "Not specified"}
              />
              <Info
                label="Languages Spoken"
                value={
                  Array.isArray(receptionist.languagesSpoken) && receptionist.languagesSpoken.length > 0
                    ? receptionist.languagesSpoken.join(", ")
                    : "Not provided"
                }
              />
              {receptionist.shiftTiming && (
                <div>
                  <h3 className="text-gray-500 text-sm mb-1">Shift Timing</h3>
                  <p className="text-gray-900">
                    {receptionist.shiftTiming.start} - {receptionist.shiftTiming.end} 
                    ({receptionist.shiftTiming.shiftType || "Not specified"})
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "documents" && (
            <div>
              {receptionist.documents && receptionist.documents.length > 0 ? (
                <ul className="space-y-3">
                  {receptionist.documents.map((doc, i) => (
                    <li
                      key={i}
                      className="flex justify-between items-center p-3 border rounded-lg bg-gray-50"
                    >
                      <div>
                        <p className="font-medium text-gray-800">{doc.name}</p>
                        <p className="text-sm text-gray-500">
                          Uploaded: {new Date(doc.uploadedAt).toLocaleString("en-IN")}
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
          {new Date(receptionist.createdAt).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </div>
      </div>

      {/* Modal */}
      <EditProfileModalReceptionist
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

// Reusable Components
function Info({ label, value }) {
  return (
    <div>
      <h3 className="text-gray-500 text-sm">{label}</h3>
      <p className="text-lg font-semibold text-gray-900">{value || "Not provided"}</p>
    </div>
  );
}

// Modal component for receptionist profile editing
function EditProfileModalReceptionist({
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
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Edit Receptionist Profile
        </h2>

        <div className="space-y-4">
          <InputField
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <InputField
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <InputField
            label="Mobile"
            value={formData.mobile}
            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
          />

          <InputField
            label="Date of Birth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
          />

          <div>
            <label className="block text-gray-700 mb-1">Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <InputField
            label="Aadhaar Card Number"
            value={formData.aadhaarCardNumber}
            onChange={(e) =>
              setFormData({ ...formData, aadhaarCardNumber: e.target.value })
            }
          />

          <InputField
            label="PAN Card Number"
            value={formData.panCardNumber}
            onChange={(e) => setFormData({ ...formData, panCardNumber: e.target.value })}
          />

          <div>
            <h3 className="text-gray-700 mb-2 font-medium">Address</h3>
            <div className="space-y-2">
              <InputField
                label="Street"
                value={formData.address.street}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, street: e.target.value },
                  })
                }
              />
              <InputField
                label="City"
                value={formData.address.city}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, city: e.target.value },
                  })
                }
              />
              <InputField
                label="State"
                value={formData.address.state}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, state: e.target.value },
                  })
                }
              />
              <InputField
                label="Zip Code"
                value={formData.address.zipCode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, zipCode: e.target.value },
                  })
                }
              />
              <InputField
                label="Country"
                value={formData.address.country}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, country: e.target.value },
                  })
                }
              />
            </div>
          </div>

          <div>
            <h3 className="text-gray-700 mb-2 font-medium">Emergency Contact</h3>
            <div className="space-y-2">
              <InputField
                label="Name"
                value={formData.emergencyContact.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emergencyContact: { ...formData.emergencyContact, name: e.target.value },
                  })
                }
              />
              <InputField
                label="Phone"
                value={formData.emergencyContact.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emergencyContact: { ...formData.emergencyContact, phone: e.target.value },
                  })
                }
              />
              <InputField
                label="Relation"
                value={formData.emergencyContact.relation}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emergencyContact: { ...formData.emergencyContact, relation: e.target.value },
                  })
                }
              />
            </div>
          </div>

          <InputField
            label="Designation"
            value={formData.designation}
            onChange={(e) =>
              setFormData({ ...formData, designation: e.target.value })
            }
          />

          <InputField
            label="Qualifications (comma separated)"
            value={Array.isArray(formData.qualifications) ? formData.qualifications.join(", ") : ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                qualifications: e.target.value
                  .split(",")
                  .map((x) => x.trim())
                  .filter(x => x.length > 0),
              })
            }
          />

          <InputField
            label="Experience Years"
            type="number"
            value={formData.experienceYears}
            onChange={(e) =>
              setFormData({ ...formData, experienceYears: e.target.value })
            }
          />

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
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
      />
    </div>
  );
}
