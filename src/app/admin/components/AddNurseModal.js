// Meraki-Frontend/src/app/admin/components/AddNurseModal.js
"use client";
import { useState } from "react";

export default function AddNurseModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    hospital_id: "",
    dateOfBirth: "",
    gender: "",
    aadhaarCardNumber: "",
    panCardNumber: "",
    qualifications: "",
    experienceYears: "",
    nursingSpecialization: "",
    licenseNumber: "",
    licenseIssuingAuthority: "",
    licenseExpiryDate: "",
    languagesSpoken: "",
    shiftTiming: {
      start: "",
      end: "",
      shiftType: "",
    },
    department: "",
    wardAssignment: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }

    setForm(prevForm => {
      if (name.startsWith("address.")) {
        const field = name.split(".")[1];
        return {
          ...prevForm,
          address: {
            ...prevForm.address,
            [field]: value
          }
        };
      } else if (name.startsWith("shiftTiming.")) {
        const field = name.split(".")[1];
        return {
          ...prevForm,
          shiftTiming: {
            ...prevForm.shiftTiming,
            [field]: value
          }
        };
      } else {
        return {
          ...prevForm,
          [name]: value
        };
      }
    });
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validations
    if (!form.fullName.trim()) newErrors.fullName = "Full Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Invalid email format";
    if (!form.mobile.trim()) newErrors.mobile = "Mobile Number is required";
    else if (!/^\d{10}$/.test(form.mobile.replace(/\D/g, ''))) newErrors.mobile = "Invalid mobile number";
    if (!form.hospital_id.trim()) newErrors.hospital_id = "Hospital ID is required";
    if (!form.gender.trim()) newErrors.gender = "Gender is required";
    if (!form.dateOfBirth) newErrors.dateOfBirth = "Date of Birth is required";
    if (!form.aadhaarCardNumber.trim()) newErrors.aadhaarCardNumber = "Aadhaar Card Number is required";
    else if (!/^\d{12}$/.test(form.aadhaarCardNumber)) newErrors.aadhaarCardNumber = "Aadhaar must be 12 digits";
    if (!form.panCardNumber.trim()) newErrors.panCardNumber = "PAN Card Number is required";
    else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.panCardNumber)) newErrors.panCardNumber = "Invalid PAN format";
    if (!form.qualifications.trim()) newErrors.qualifications = "Qualifications are required";
    if (!form.experienceYears) newErrors.experienceYears = "Experience is required";
    if (!form.nursingSpecialization.trim()) newErrors.nursingSpecialization = "Specialization is required";
    if (!form.department.trim()) newErrors.department = "Department is required";
    if (!form.wardAssignment.trim()) newErrors.wardAssignment = "Ward Assignment is required";

    // Address validations
    if (!form.address.street.trim()) newErrors["address.street"] = "Street is required";
    if (!form.address.city.trim()) newErrors["address.city"] = "City is required";
    if (!form.address.state.trim()) newErrors["address.state"] = "State is required";
    if (!form.address.zipCode.trim()) newErrors["address.zipCode"] = "ZIP Code is required";
    if (!form.address.country.trim()) newErrors["address.country"] = "Country is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const payload = {
      ...form,
      qualifications: form.qualifications
        ? form.qualifications.split(",").map((q) => q.trim())
        : [],
      languagesSpoken: form.languagesSpoken
        ? form.languagesSpoken.split(",").map((l) => l.trim())
        : [],
      nursingSpecialization: form.nursingSpecialization
        ? form.nursingSpecialization.split(",").map((s) => s.trim())
        : [],
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_ADMIN_API_BASE}/nurses/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server did not return valid JSON. Check API URL or backend.");
      }

      if (!res.ok) throw new Error(data.message || "Error registering nurse");
      alert("✅ Nurse registered successfully!");
      onSuccess?.();
      onClose();
    } catch (err) {
      alert(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, name, type = "text", placeholder, required = true, halfWidth = false }) => {
    // Get value from nested object if needed
    let value = '';
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      value = form[parent]?.[child] || '';
    } else {
      value = form[name] || '';
    }
    
    return (
      <div className={halfWidth ? "col-span-1" : "col-span-2"}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          required={required}
          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            errors[name] ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-blue-300"
          }`}
        />
        {errors[name] && <p className="text-red-600 text-sm mt-1">{errors[name]}</p>}
      </div>
    );
  };

  const AddressField = ({ label, name, placeholder, required = true }) => (
    <div className="col-span-2 lg:col-span-1">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        name={`address.${name}`}
        placeholder={placeholder}
        value={form.address[name]}
        onChange={handleChange}
        required={required}
        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
          errors[`address.${name}`] ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-blue-300"
        }`}
      />
      {errors[`address.${name}`] && <p className="text-red-600 text-sm mt-1">{errors[`address.${name}`]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <i className="bi bi-heart-pulse text-white text-xl"></i>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Register New Nurse</h2>
                <p className="text-green-100 text-sm">Add a new nursing professional to the healthcare system</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <i className="bi bi-x-lg text-white text-lg"></i>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="bg-green-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                <i className="bi bi-info-circle mr-2"></i>
                Basic Information
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <InputField label="Full Name" name="fullName" placeholder="Enter full name" />
                <InputField label="Email Address" name="email" type="email" placeholder="Enter email address" />
                <InputField label="Mobile Number" name="mobile" placeholder="Enter mobile number" />
                <InputField label="Hospital ID" name="hospital_id" placeholder="Enter hospital ID" />
                <div className="col-span-2 lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.gender ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && <p className="text-red-600 text-sm mt-1">{errors.gender}</p>}
                </div>
                <InputField label="Date of Birth" name="dateOfBirth" type="date" />
              </div>
            </div>

            {/* Personal Information Section */}
            <div className="bg-green-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                <i className="bi bi-person-vcard mr-2"></i>
                Personal Information
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <InputField label="Aadhaar Card Number" name="aadhaarCardNumber" placeholder="Enter 12-digit Aadhaar number" />
                <InputField label="PAN Card Number" name="panCardNumber" placeholder="Enter PAN card number" />
              </div>
            </div>

            {/* Address Section */}
            <div className="bg-green-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                <i className="bi bi-geo-alt mr-2"></i>
                Address Information
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <AddressField label="Street" name="street" placeholder="Enter street address" />
                <AddressField label="City" name="city" placeholder="Enter city" />
                <AddressField label="State" name="state" placeholder="Enter state" />
                <AddressField label="ZIP Code" name="zipCode" placeholder="Enter ZIP code" />
                <AddressField label="Country" name="country" placeholder="Enter country" />
              </div>
            </div>

            {/* Professional Information Section */}
            <div className="bg-green-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                <i className="bi bi-briefcase mr-2"></i>
                Professional Information
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <InputField label="Qualifications" name="qualifications" placeholder="B.Sc Nursing, GNM, etc. (comma separated)" />
                <InputField label="Experience (Years)" name="experienceYears" type="number" placeholder="Enter years of experience" />
                <InputField label="Nursing Specialization" name="nursingSpecialization" placeholder="ICU, Emergency, Pediatrics, etc." />
                <InputField label="Nursing License Number" name="licenseNumber" placeholder="Enter nursing license number" />
                <InputField label="License Issuing Authority" name="licenseIssuingAuthority" placeholder="Enter issuing authority" />
                <InputField label="License Expiry Date" name="licenseExpiryDate" type="date" />
                <InputField label="Languages Spoken" name="languagesSpoken" placeholder="English, Hindi, etc. (comma separated)" />
                <InputField label="Department" name="department" placeholder="ICU, Emergency, OPD, etc." />
                <InputField label="Ward Assignment" name="wardAssignment" placeholder="Ward A, ICU Ward, etc." />
              </div>
            </div>

            {/* Shift Timing Section */}
            <div className="bg-green-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                <i className="bi bi-clock mr-2"></i>
                Shift Timing
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <InputField label="Shift Start Time" name="shiftTiming.start" type="time" />
                <InputField label="Shift End Time" name="shiftTiming.end" type="time" />
                <div className="col-span-2 lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shift Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="shiftTiming.shiftType"
                    value={form.shiftTiming.shiftType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-blue-300"
                  >
                    <option value="">Select Shift Type</option>
                    <option value="Morning">Morning Shift</option>
                    <option value="Evening">Evening Shift</option>
                    <option value="Night">Night Shift</option>
                    <option value="General">General Shift</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 mt-6">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <i className="bi bi-arrow-repeat animate-spin mr-2"></i>
                      Registering...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-heart-pulse mr-2"></i>
                      Register Nurse
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}