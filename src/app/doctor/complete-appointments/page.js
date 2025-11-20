"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function CompleteAppointmentPage() {
  const router = useRouter();
  const [appointmentData, setAppointmentData] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [patientDocuments, setPatientDocuments] = useState([]);
  const [patientRecords, setPatientRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedData = localStorage.getItem("activeAppointment");
    console.log("Raw localStorage data:", storedData); // Step 1

    if (storedData) {
      const appointment = JSON.parse(storedData);
      console.log("Parsed Appointment Object:", appointment); // Step 1
      setAppointmentData(appointment);
      fetchPatientData(appointment.patientId);
      fetchPatientDocuments(appointment.patientId);
      fetchPatientRecords(appointment.patientId);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchPatientData = async (patientId) => {
    try {
      const res = await fetch(`http://localhost:3000/patients/${patientId}`);

      if (res.status === 404) {
        console.warn(`Patient not found (404): ${patientId}`);
        setPatientData(null);
        return;
      }

      if (!res.ok) {
        console.warn(`Failed to fetch patient data. Status: ${res.status}`);
        setPatientData(null);
        return;
      }

      const result = await res.json();
      console.log("Fetched Patient Data:", result.data);
      setPatientData(result.data || null);
    } catch (err) {
      console.error("Network error fetching patient data:", err.message);
      setPatientData(null);
    }
  };

  const fetchPatientDocuments = async (patientId) => {
    try {
      const user = JSON.parse(localStorage.getItem("hmsUser"));
      const token = user?.token;
      if (!token) return;

      const res = await fetch(
        `http://localhost:3000/patient-uploads/${patientId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.status === 404) {
        console.warn(`No uploads found for patient ${patientId}`);
        setPatientDocuments([]);
        return;
      }

      if (!res.ok) {
        console.warn(`Failed to fetch documents. Status: ${res.status}`);
        setPatientDocuments([]);
        return;
      }

      const data = await res.json();
      const allFiles = (data.uploads || []).flatMap((upload) =>
        (upload.files || []).map((file) => ({
          url: file.file_url,
          type:
            file.file_type === "pdf" ? "application/pdf" : file.file_type || "",
          name: upload.diagnosis || "Patient Document",
        }))
      );

      setPatientDocuments(allFiles);
    } catch (err) {
      console.error("Network error fetching patient documents:", err.message);
      setPatientDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientRecords = async (patientId) => {
    try {
      const user = JSON.parse(localStorage.getItem("hmsUser"));
      const doctorId = user?.doctorid;
      const token = user?.token;

      if (!doctorId || !token) return;

      const res = await fetch(
        `http://localhost:3000/patient-records/patient/${patientId}/doctor/${doctorId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.status === 404) {
        console.warn(`No past records found for patient ${patientId}`);
        setPatientRecords([]);
        return;
      }

      if (!res.ok) {
        console.warn(`Failed to fetch records. Status: ${res.status}`);
        setPatientRecords([]);
        return;
      }

      const data = await res.json();
      console.log("Fetched Patient Records:", data.records);
      setPatientRecords(data.records || []);
    } catch (err) {
      console.error("Network error fetching patient records:", err.message);
      setPatientRecords([]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!appointmentData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-600">
        <p className="text-lg mb-3">No appointment selected.</p>
        <button
          onClick={() => router.push("/doctor/appointments")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Back to Appointments
        </button>
      </div>
    );
  }

  return (
    <main className="flex-1 p-6 bg-gray-50 min-h-screen text-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Complete Appointment
          </h1>
          <p className="text-gray-700">
            Review and complete details for this appointment
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => router.push("/doctor/appointments")}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition"
          >
            ← Back
          </button>

          <button
            onClick={() => {
              const fullName =
                patientData?.name ||
                `${patientData?.firstName || ""} ${
                  patientData?.lastName || ""
                }`.trim();

              localStorage.setItem(
                "prescriptionContext",
                JSON.stringify({
                  patientId: patientData?._id || "",
                  appointmentId:
                    appointmentData?.id || appointmentData?._id || "",
                  patientName: fullName || "N/A",
                  patientEmail: patientData?.email || "",
                })
              );

              localStorage.setItem("prescriptionTab", "new");
              router.push("/doctor/prescriptions");
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            Create Prescription
          </button>
        </div>
      </div>

      {/* Tabs Wrapper */}
      <Tabs defaultValue="appointment" className="w-full mt-6">
        {/* Tab Navigation */}
        <TabsList className="grid grid-cols-5 w-full bg-white rounded-xl shadow-sm mb-6">
          <TabsTrigger
            value="appointment"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all"
          >
            Appointment Info
          </TabsTrigger>
          <TabsTrigger
            value="patient"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all"
          >
            Patient Info
          </TabsTrigger>
          <TabsTrigger
            value="emergency"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all"
          >
            Emergency Contact
          </TabsTrigger>
          <TabsTrigger
            value="documents"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all"
          >
            Documents
          </TabsTrigger>
          <TabsTrigger
            value="records"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all"
          >
            Past Records
          </TabsTrigger>
        </TabsList>

        {/* -------- Appointment Info Tab -------- */}
        <TabsContent value="appointment">
          <div className="bg-white rounded-2xl shadow-sm border p-6 transition-all hover:shadow-md">
            <h2 className="text-lg font-semibold mb-4">
              Appointment Information
            </h2>
            <table className="min-w-full text-sm border rounded-lg overflow-hidden text-gray-900">
              <tbody>
                <tr className="bg-gray-50">
                  <td className="p-3 font-medium w-1/4 border-b">Date</td>
                  <td className="p-3 border-b">
                    {appointmentData.date || "N/A"}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-medium border-b">Time</td>
                  <td className="p-3 border-b">
                    {appointmentData.slotStart && appointmentData.slotEnd
                      ? `${appointmentData.slotStart} - ${appointmentData.slotEnd}`
                      : "N/A"}
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-3 font-medium border-b">Session Type</td>
                  <td className="p-3 border-b">
                    {appointmentData.sessionType || "N/A"}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-medium border-b">Reason</td>
                  <td className="p-3 border-b">
                    {appointmentData.reason || "N/A"}
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-3 font-medium border-b">Status</td>
                  <td className="p-3 border-b capitalize">
                    {appointmentData.status || "N/A"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* -------- Patient Info Tab -------- */}
        {/* Patient Info */}
{/* -------- Patient Info Tab -------- */}
<TabsContent value="patient">
  {patientData ? (
    <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        🧍 Patient Information
      </h2>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        {/* Profile Image + Email */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <img
            src={patientData.profileImage || "/default-profile.png"}
            alt={patientData.name}
            className="w-36 h-36 rounded-full object-cover border shadow-sm"
          />
          <p className="mt-3 font-medium text-lg text-gray-900">{patientData.name}</p>
          <p className="text-sm text-gray-600">{patientData.email}</p>
        </div>

        {/* Info Grid */}
        <div className="flex-1 grid sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 text-sm text-gray-900">
          <div>
            <p className="font-medium text-gray-700">Mobile</p>
            <p>{patientData.mobile || patientData.contact || "N/A"}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Date of Birth</p>
            <p>{patientData.dob?.split("T")[0] || "N/A"}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Gender</p>
            <p>{patientData.gender || "N/A"}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Blood Group</p>
            <p>{patientData.blood_group || "N/A"}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Height / Weight</p>
            <p>{patientData.height || "N/A"} cm / {patientData.weight || "N/A"} kg</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Occupation</p>
            <p>{patientData.occupation || "N/A"}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Marital Status</p>
            <p>{patientData.marital_status || "N/A"}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Activity Level</p>
            <p>{patientData.activity_level || "N/A"}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Food Preference</p>
            <p>{patientData.food_preference || "N/A"}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Smoking Habits</p>
            <p>{patientData.smoking_habits || "N/A"}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Alcohol Consumption</p>
            <p>{patientData.alcohol_consumption || "N/A"}</p>
          </div>
          <div className="col-span-2 md:col-span-3">
            <p className="font-medium text-gray-700">Address</p>
            <p>{patientData.address || "N/A"}</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <hr className="my-6" />

      {/* Medical History */}
      <h3 className="text-md font-semibold mb-2 flex items-center gap-2">
        💊 Medical History
      </h3>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-900">
        <div>
          <p className="font-medium text-gray-700">Allergies</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {patientData.allergies?.length > 0
              ? patientData.allergies.map((a, i) => (
                  <span key={i} className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                    {a}
                  </span>
                ))
              : "N/A"}
          </div>
        </div>

        <div>
          <p className="font-medium text-gray-700">Chronic Diseases</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {patientData.chronic_diseases?.length > 0
              ? patientData.chronic_diseases.map((d, i) => (
                  <span key={i} className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                    {d}
                  </span>
                ))
              : "N/A"}
          </div>
        </div>

        <div>
          <p className="font-medium text-gray-700">Surgeries</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {patientData.surgeries?.length > 0
              ? patientData.surgeries.map((s, i) => (
                  <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    {s}
                  </span>
                ))
              : "N/A"}
          </div>
        </div>

        <div>
          <p className="font-medium text-gray-700">Injuries</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {patientData.injuries?.length > 0
              ? patientData.injuries.map((inj, i) => (
                  <span key={i} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                    {inj}
                  </span>
                ))
              : "N/A"}
          </div>
        </div>

        <div>
          <p className="font-medium text-gray-700">Current Medications</p>
          <p className="mt-1">
            {patientData.current_medications?.length > 0
              ? patientData.current_medications.join(", ")
              : "N/A"}
          </p>
        </div>

        <div>
          <p className="font-medium text-gray-700">Past Medications</p>
          <p className="mt-1">
            {patientData.past_medications?.length > 0
              ? patientData.past_medications.join(", ")
              : "N/A"}
          </p>
        </div>
      </div>
    </div>
  ) : (
    <p className="text-center text-gray-600">No patient data available.</p>
  )}
</TabsContent>


        {/* -------- Emergency Contact Tab -------- */}
        <TabsContent value="emergency">
          {patientData?.emergency_contact ? (
            <div className="bg-white rounded-2xl shadow-sm border p-6 transition-all hover:shadow-md">
              <h2 className="text-lg font-semibold mb-4">Emergency Contact</h2>
              <table className="min-w-full text-sm border rounded-lg overflow-hidden text-gray-900">
                <tbody>
                  <tr className="bg-gray-50">
                    <td className="p-3 font-medium w-1/4 border-b">Name</td>
                    <td className="p-3 border-b">
                      {patientData.emergency_contact.first_name}{" "}
                      {patientData.emergency_contact.last_name}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium border-b">Relationship</td>
                    <td className="p-3 border-b">
                      {patientData.emergency_contact.relationship}
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-3 font-medium border-b">Phone</td>
                    <td className="p-3 border-b">
                      {patientData.emergency_contact.phone}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium border-b">Email</td>
                    <td className="p-3 border-b">
                      {patientData.emergency_contact.email}
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-3 font-medium border-b">City</td>
                    <td className="p-3 border-b">
                      {patientData.emergency_contact.city}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium border-b">Address</td>
                    <td className="p-3 border-b">
                      {patientData.emergency_contact.address}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-600">
              No emergency contact found.
            </p>
          )}
        </TabsContent>

        {/* -------- Documents Tab -------- */}
        <TabsContent value="documents">
          {patientDocuments.length > 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border p-6 transition-all hover:shadow-md">
              <h2 className="text-lg font-semibold mb-4">
                Patient Documents / History
              </h2>
              <ul className="list-disc list-inside text-gray-800 space-y-2">
                {patientDocuments.map((doc, idx) => (
                  <li key={idx}>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {doc.name} ({doc.type || "file"})
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-center text-gray-600">No documents uploaded.</p>
          )}
        </TabsContent>

        {/* -------- Past Records Tab -------- */}
        {/* -------- Past Records Tab -------- */}
        <TabsContent value="records">
          {patientRecords.length > 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border p-6 transition-all hover:shadow-md">
              <h2 className="text-lg font-semibold mb-4">Past Appointments</h2>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border-collapse border border-gray-200 rounded-xl text-gray-900">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="p-3 text-left border">Visit Date</th>
                      <th className="p-3 text-left border">Symptoms</th>
                      <th className="p-3 text-left border">Diagnosis</th>
                      <th className="p-3 text-left border">Notes</th>
                      <th className="p-3 text-left border">
                        Recommended Tests
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientRecords
                      .slice() // to avoid mutating the original array
                      .sort(
                        (a, b) =>
                          new Date(b.visit_date) - new Date(a.visit_date)
                      )
                      .map((record, idx) => (
                        <tr
                          key={record._id || idx}
                          className={`${
                            idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                          } hover:bg-blue-50 transition`}
                        >
                          <td className="p-3 border">
                            {record.visit_date?.split("T")[0] || "N/A"}
                          </td>
                          <td className="p-3 border">
                            {(record.symptoms || []).join(", ") || "N/A"}
                          </td>
                          <td className="p-3 border">
                            {record.diagnosis || "N/A"}
                          </td>
                          <td className="p-3 border">
                            {record.notes || "N/A"}
                          </td>
                          <td className="p-3 border">
                            {(record.recommended_tests || []).join(", ") ||
                              "N/A"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-600">No past records found.</p>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}
