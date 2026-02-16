"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ViewStaffPage() {
  const router = useRouter();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("hmsToken");
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    fetchStaffData(token);
  }, [router]);


const fetchStaffData = async (token) => {
  try {
    setLoading(true);

    // Get the logged-in admin's hospital ID (assuming stored in localStorage)
    const hospitalId = localStorage.getItem("hospitalId"); 
    if (!hospitalId) {
      alert("Hospital ID not found in localStorage");
      return;
    }

    const baseURL = process.env.NEXT_PUBLIC_ADMIN_API_BASE || "http://localhost:3000";

    // Fetch both doctors and receptionists by hospital ID
    const [doctorsRes, receptionistsRes] = await Promise.all([
      fetch(`${baseURL}/receptionists/doctors/${hospitalId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${baseURL}/receptionists/receptionists/${hospitalId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    if (!doctorsRes.ok || !receptionistsRes.ok) {
      throw new Error("Failed to fetch staff data");
    }

    const doctorsData = await doctorsRes.json();
    const receptionistsData = await receptionistsRes.json();

    // Extract arrays properly (they’re inside doctorsData.doctors and receptionistsData.receptionists)
    const doctors = doctorsData.doctors || [];
    const receptionists = receptionistsData.receptionists || [];

    const combinedStaff = [
      ...doctors.map(doc => ({ ...doc, type: "Doctor", id: doc._id })),
      ...receptionists.map(rec => ({ ...rec, type: "Receptionist", id: rec._id })),
    ];

    setStaff(combinedStaff);
  } catch (error) {
    console.error("Error fetching staff:", error);
    alert("Failed to load staff data");
  } finally {
    setLoading(false);
  }
};


  const handleViewDetails = (staffMember) => {
    setSelectedStaff(staffMember);
    setShowDetailsModal(true);
  };

  const getStaffTypeCount = (type) => {
    return staff.filter(member => member.type === type).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Link 
                href="/admin/staff" 
                className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
              >
                <i className="bi bi-arrow-left mr-2"></i>
                Back to Staff Management
              </Link>
              <h1 className="text-3xl font-bold text-gray-800">View All Staff</h1>
              <p className="text-gray-600 mt-2">
                Total {staff.length} staff members ({getStaffTypeCount("Doctor")} doctors, {getStaffTypeCount("Receptionist")} receptionists)
              </p>
            </div>
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/80 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff Member
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specialization/Qualifications
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {staff.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        member.type === "Doctor" 
                          ? "bg-blue-100 text-blue-800" 
                          : "bg-green-100 text-green-800"
                      }`}>
                        {member.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.contact || member.mobile}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {member.type === "Doctor" 
                          ? member.specialization 
                          : member.qualifications?.join(", ")
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewDetails(member)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        View More
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {staff.length === 0 && (
            <div className="text-center py-12">
              <i className="bi bi-people text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-500 text-lg">No staff members found</p>
              <p className="text-gray-400 text-sm mt-1">
                Start by adding doctors or receptionists to your staff.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Staff Details Modal */}
      {showDetailsModal && selectedStaff && (
        <StaffDetailsModal
          staff={selectedStaff}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </div>
  );
}

// Staff Details Modal Component
function StaffDetailsModal({ staff, onClose }) {
  const renderDoctorDetails = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Specialization</label>
          <p className="text-gray-900">{staff.specialization}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Medical License</label>
          <p className="text-gray-900">{staff.medicalLicenseNumber}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Years of Experience</label>
          <p className="text-gray-900">{staff.yearsOfExperience}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">License Expiry</label>
          <p className="text-gray-900">{staff.licenseExpiryDate}</p>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-500">Qualifications</label>
        <p className="text-gray-900">{staff.qualifications?.join(", ")}</p>
      </div>
    </div>
  );

  const renderReceptionistDetails = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Experience</label>
          <p className="text-gray-900">{staff.experienceYears} years</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Shift Type</label>
          <p className="text-gray-900">{staff.shiftTiming?.shiftType}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Shift Timing</label>
          <p className="text-gray-900">
            {staff.shiftTiming?.start} - {staff.shiftTiming?.end}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Languages</label>
          <p className="text-gray-900">{staff.languagesSpoken?.join(", ")}</p>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-500">Qualifications</label>
        <p className="text-gray-900">{staff.qualifications?.join(", ")}</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Staff Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <i className="bi bi-x-lg text-gray-500"></i>
            </button>
          </div>

          {/* Basic Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {staff.name?.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{staff.name}</h3>
                <p className="text-gray-600">{staff.email}</p>
              </div>
              <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${
                staff.type === "Doctor" 
                  ? "bg-blue-100 text-blue-800" 
                  : "bg-green-100 text-green-800"
              }`}>
                {staff.type}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Contact:</span>
                <p className="text-gray-900">{staff.contact || staff.mobile}</p>
              </div>
              <div>
                <span className="text-gray-500">Hospital ID:</span>
                <p className="text-gray-900">{staff.hospital_id}</p>
              </div>
              <div>
                <span className="text-gray-500">Gender:</span>
                <p className="text-gray-900">{staff.gender}</p>
              </div>
              <div>
                <span className="text-gray-500">Date of Birth:</span>
                <p className="text-gray-900">{staff.dateOfBirth}</p>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Address</h4>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-gray-900">{staff.address?.street}</p>
              <p className="text-gray-900">
                {staff.address?.city}, {staff.address?.state} {staff.address?.zipCode}
              </p>
              <p className="text-gray-900">{staff.address?.country}</p>
            </div>
          </div>

          {/* Professional Details */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-3">
              Professional Details
            </h4>
            {staff.type === "Doctor" ? renderDoctorDetails() : renderReceptionistDetails()}
          </div>

          {/* Footer */}
          <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}