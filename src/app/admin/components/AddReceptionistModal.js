"use client";
import { useState } from "react";

export default function AddReceptionistModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    hospital_id: "",
    dateOfBirth: "",
    gender: "",
    aadhaarCardNumber: "",
    panCardNumber: "",
    qualifications: "",
    experienceYears: "",
    languagesSpoken: "",
    shiftTiming: {
      start: "",
      end: "",
      shiftType: "",
    },
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setForm({ ...form, address: { ...form.address, [field]: value } });
    } else if (name.startsWith("shiftTiming.")) {
      const field = name.split(".")[1];
      setForm({ ...form, shiftTiming: { ...form.shiftTiming, [field]: value } });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      qualifications: form.qualifications
        ? form.qualifications.split(",").map((q) => q.trim())
        : [],
      languagesSpoken: form.languagesSpoken
        ? form.languagesSpoken.split(",").map((l) => l.trim())
        : [],
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/receptionists/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error registering receptionist");
      alert("✅ Receptionist registered successfully!");
      onSuccess?.();
      onClose();
    } catch (err) {
      alert(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-2xl overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Register New Receptionist
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {/* Basic Info */}
          <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required className="border p-2 rounded-lg" />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required className="border p-2 rounded-lg" />
          <input name="mobile" placeholder="Mobile" value={form.mobile} onChange={handleChange} required className="border p-2 rounded-lg" />
          <input name="hospital_id" placeholder="Hospital ID" value={form.hospital_id} onChange={handleChange} required className="border p-2 rounded-lg" />
          <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} required className="border p-2 rounded-lg" />
          <input name="gender" placeholder="Gender" value={form.gender} onChange={handleChange} required className="border p-2 rounded-lg" />
          <input name="aadhaarCardNumber" placeholder="Aadhaar Card Number" value={form.aadhaarCardNumber} onChange={handleChange} required className="border p-2 rounded-lg" />
          <input name="panCardNumber" placeholder="PAN Card Number" value={form.panCardNumber} onChange={handleChange} required className="border p-2 rounded-lg" />

          {/* Address */}
          <h3 className="col-span-2 font-semibold text-gray-700 mt-4">Address</h3>
          <input name="address.street" placeholder="Street" value={form.address.street} onChange={handleChange} required className="border p-2 rounded-lg" />
          <input name="address.city" placeholder="City" value={form.address.city} onChange={handleChange} required className="border p-2 rounded-lg" />
          <input name="address.state" placeholder="State" value={form.address.state} onChange={handleChange} required className="border p-2 rounded-lg" />
          <input name="address.zipCode" placeholder="ZIP Code" value={form.address.zipCode} onChange={handleChange} required className="border p-2 rounded-lg" />
          <input name="address.country" placeholder="Country" value={form.address.country} onChange={handleChange} required className="border p-2 rounded-lg" />

          {/* Professional Info */}
          <input name="qualifications" placeholder="Qualifications (comma separated)" value={form.qualifications} onChange={handleChange} required className="border p-2 rounded-lg col-span-2" />
          <input name="experienceYears" type="number" placeholder="Experience (years)" value={form.experienceYears} onChange={handleChange} required className="border p-2 rounded-lg" />
          <input name="languagesSpoken" placeholder="Languages (comma separated)" value={form.languagesSpoken} onChange={handleChange} required className="border p-2 rounded-lg col-span-2" />

          {/* Shift Timing */}
          <h3 className="col-span-2 font-semibold text-gray-700 mt-4">Shift Timing</h3>
          <input name="shiftTiming.start" type="time" value={form.shiftTiming.start} onChange={handleChange} required className="border p-2 rounded-lg" />
          <input name="shiftTiming.end" type="time" value={form.shiftTiming.end} onChange={handleChange} required className="border p-2 rounded-lg" />
          <input name="shiftTiming.shiftType" placeholder="Shift Type (Morning/Evening/Night)" value={form.shiftTiming.shiftType} onChange={handleChange} required className="border p-2 rounded-lg col-span-2" />

          {/* Buttons */}
          <div className="col-span-2 flex justify-end mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 mr-2 bg-gray-300 rounded-lg">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              {loading ? "Registering..." : "Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
