"use client";

import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function CreateAdmissionPage() {
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [patientFound, setPatientFound] = useState(null);

  const [form, setForm] = useState({
    identifier: "",
    admissionData: {
      admissionDateTime: "",
      fullName: "",
      dob: "",
      age: "",
      gender: "",
      bloodGroup: "",
      contactNumber: "",
      alternateContactNumber: "",
      email: "",
      permanentAddress: "",
      emergencyContactName: "",
      emergencyContactRelationship: "",
      emergencyContactNumber: "",
      wardType: "",
      reasonForAdmission: "",
      provisionalDiagnosis: "",
      referralFrom: "",
      pastMedicalHistory: [],
      pastSurgicalHistory: [],
      allergies: [],
      insuranceProvider: "",
      policyNumber: "",
      tpaDetails: "",
      policyValidity: "",
      authorizationNumber: "",
      corporateTieUp: "",
      paymentMode: "",
      guardianName: "",
      guardianRelationship: "",
      guardianContact: "",
      guardianAddress: "",
      consentAdmission: false,
      consentTreatment: false,
      consentAnesthesia: false,
      consentInformationSharing: false,
      witnessName: "",
      vitalSigns: {
        bp: "",
        pulse: "",
        temperature: "",
        spo2: "",
      },
      weight: "",
      height: "",
      initialAssessmentSummary: "",
      riskAssessment: {
        fallRisk: "",
        pressureUlcerRisk: "",
      },
      requiredInvestigations: [],
      admissionOfficerName: "",
      remarks: "",
    },
    signatures: {},
  });

  /* ----------------------------- ADMIN VALIDATION ----------------------------- */

  const getAdmin = () => {
    const stored = localStorage.getItem("hmsUser");
    if (!stored) {
      alert("Admin not logged in");
      return null;
    }
    const user = JSON.parse(stored);

    if (user.role !== "admin") {
      alert("Only Admin can create admission");
      return null;
    }

    return user;
  };

  /* ----------------------------- INPUT HANDLER ----------------------------- */

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes("vitalSigns.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        admissionData: {
          ...prev.admissionData,
          vitalSigns: {
            ...prev.admissionData.vitalSigns,
            [key]: value,
          },
        },
      }));
      return;
    }

    if (name.includes("riskAssessment.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        admissionData: {
          ...prev.admissionData,
          riskAssessment: {
            ...prev.admissionData.riskAssessment,
            [key]: value,
          },
        },
      }));
      return;
    }

    if (name in form.admissionData) {
      setForm((prev) => ({
        ...prev,
        admissionData: {
          ...prev.admissionData,
          [name]: value,
        },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckbox = (e) => {
    const { name, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      admissionData: {
        ...prev.admissionData,
        [name]: checked,
      },
    }));
  };

  const handleArrayInput = (name, value) => {
    setForm((prev) => ({
      ...prev,
      admissionData: {
        ...prev.admissionData,
        [name]: value.split(",").map((v) => v.trim()),
      },
    }));
  };

  /* ----------------------------- FIND PATIENT ----------------------------- */

  const searchPatient = async () => {
    const admin = getAdmin();
    if (!admin) return;

    if (!form.identifier) return alert("Enter email/phone");

    try {
      setSearching(true);

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE}/admissions/find-patient`,
        {
          identifier: form.identifier,
          hospitalId: admin.hospitalId,
        },
        {
          headers: { Authorization: `Bearer ${admin.token}` },
        },
      );

      if (res.data.found) {
        const p = res.data.patient;

        setForm((prev) => ({
          ...prev,
          admissionData: {
            ...prev.admissionData,
            fullName: p.name || "",
            dob: p.dob ? p.dob.split("T")[0] : "",
            age: p.age || "",
            gender: p.gender || "",
            contactNumber: p.mobile || p.phone || "",
            email: p.email || "",
            permanentAddress: p.address || "",
          },
        }));

        setPatientFound(true);
      } else {
        setPatientFound(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error searching patient");
    } finally {
      setSearching(false);
    }
  };

  /* ----------------------------- CREATE ADMISSION ----------------------------- */

  const handleSubmit = async () => {
  const admin = getAdmin();
  if (!admin) return;

  try {
    setLoading(true);

    await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE}/admissions`,
      {
        ...form,
        hospitalId: admin.hospitalId,
        adminId: admin.id,
      },
      {
        headers: { Authorization: `Bearer ${admin.token}` },
      },
    );

    alert("Admission Created Successfully");
  } catch (err) {
    alert(err.response?.data?.message || "Failed to create admission");
  } finally {
    setLoading(false);
  }
};


  /* ----------------------------- UI ----------------------------- */

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-6xl mx-auto bg-white p-8 rounded-2xl shadow-xl"
      >
        <h1 className="text-3xl font-bold mb-6 text-blue-700">
          🏥 Create Admission (Admin)
        </h1>

        {/* Search Section */}
        <div className="bg-blue-50 p-5 rounded-xl mb-6">
          <div className="flex gap-3">
            <input
              name="identifier"
              value={form.identifier}
              onChange={handleChange}
              placeholder="Search by Email / Phone"
              className="flex-1 border p-3 rounded-lg"
            />
            <button
              onClick={searchPatient}
              className="bg-blue-600 text-white px-6 rounded-lg"
            >
              {searching ? "Searching..." : "Search"}
            </button>
          </div>

          {patientFound === true && (
            <p className="text-green-600 mt-2">✔ Patient Found</p>
          )}
          {patientFound === false && (
            <p className="text-red-500 mt-2">✘ New Patient</p>
          )}
        </div>

        {/* Basic Info */}
        <Section title="Patient Information">
          <GridInput form={form} handleChange={handleChange} />
        </Section>

        {/* Medical */}
        <Section title="Medical Details">
          <TextArea
            label="Reason For Admission"
            name="reasonForAdmission"
            onChange={handleChange}
          />
          <TextArea
            label="Provisional Diagnosis"
            name="provisionalDiagnosis"
            onChange={handleChange}
          />
        </Section>

        <div className="mt-8 text-right">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-green-600 text-white px-10 py-3 rounded-xl"
          >
            {loading ? "Creating..." : "Create Admission"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* COMPONENTS */

function Section({ title, children }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">{title}</h2>
      <div className="grid grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function GridInput({ form, handleChange }) {
  const fields = [
    "fullName",
    "dob",
    "age",
    "gender",
    "bloodGroup",
    "weight",
    "height",
    "contactNumber",
    "alternateContactNumber",
    "email",
    "permanentAddress",
    "emergencyContactName",
    "emergencyContactRelationship",
    "emergencyContactNumber",
    "wardType",
    "referralFrom",
    "guardianName",
    "guardianRelationship",
    "guardianContact",
    "guardianAddress",

    "initialAssessmentSummary",
    "admissionOfficerName",
    "remarks",
  ];

  return fields.map((field) => (
    <div key={field}>
      <label className="block text-sm mb-1 capitalize">{field}</label>
      <input
        name={field}
        value={
          field === "bedNumber"
            ? form.bedNumber
            : form.admissionData[field] || ""
        }
        onChange={handleChange}
        className="w-full border p-2 rounded-lg"
      />
    </div>
  ));
}

function TextArea({ label, ...props }) {
  return (
    <div className="col-span-2">
      <label className="block text-sm mb-1">{label}</label>
      <textarea {...props} className="w-full border p-2 rounded-lg" rows="3" />
    </div>
  );
}
