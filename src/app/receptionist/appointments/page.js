"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import BillingPage from "@/components/Billing/BillingPage";
import Sidebar from "@/components/Sidebar";
import api from "@/utils/api";

export default function AppointmentsPage() {
  const router = useRouter();
  const [tab, setTab] = useState("scheduled");
  const [mode, setMode] = useState("book");
  const [viewTab, setViewTab] = useState("scheduled");
  const [currentPageScheduled, setCurrentPageScheduled] = useState(1);
  const [currentPageRecent, setCurrentPageRecent] = useState(1);
  const pageSize = 6;
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [resModal, setResModal] = useState({
    open: false,
    appt: null,
    date: "",
    slot: "",
    slots: [],
  });
  const [showPrescription, setShowPrescription] = useState(false);
  const [prescription, setPrescription] = useState(null);
  const [error, setError] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [formData, setFormData] = useState({
    patientId: "",
    patientName: "",
    reason: "",
    department: "",
    doctor: "",
    date: "",
    startTime: "",
    sessionType: "checkup",
    appointmentType: "In-person",
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [allMeetings, setAllMeetings] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFilter, setSearchFilter] = useState("all"); // 'all', 'patient', 'doctor', 'date'

  // State for the filtered and paginated meetings
  const [displayMeetings, setDisplayMeetings] = useState([]);

  const suggestionRef = useRef(null);
  const [hospitalId, setHospitalId] = useState(null);

  useEffect(() => {
    const fetchUserAndSetHospitalId = async () => {
      const hmsUser = JSON.parse(localStorage.getItem("hmsUser") || "{}");
      const token = hmsUser?.token;

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        // Decode token to get receptionist ID
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const receptionistId = decodedToken.id;

        // Fetch profile to get hospital_id
        const res = await api.put(`/receptionists/${receptionistId}/profile`, {}, { headers: { Authorization: `Bearer ${token}` } });
        const hospitalIdFromProfile = res.data.receptionist?.hospital_id;
        console.log("✅ Fetched hospital_id from profile:", hospitalIdFromProfile);
        setHospitalId(hospitalIdFromProfile);
      } catch (error) {
        console.error("🚨 Error fetching receptionist profile for hospital_id:", error);
      }
    };
    fetchUserAndSetHospitalId();
  }, [router]);

  // Place this at the top of your component (e.g., inside AppointmentsPage)
  useEffect(() => {
    const fetchAllDoctors = async () => {
      if (!hospitalId) return;
      try {
        const res = await api.get(`/receptionists/doctors/${hospitalId}`);
        setDoctors(res.data.doctors || []);
        console.log('Doctors API response', res.data);
        const allDoctors = Array.isArray(res.data?.doctors)
          ? res.data.doctors
          : Array.isArray(res.data)
            ? res.data
            : [];
        setDoctors(allDoctors);
      } catch (error) {
        console.error("Failed to fetch all doctors for appointment cards:", error);
        setDoctors([]);
      }
    };
    fetchAllDoctors();
  }, [hospitalId]);

  //For fetching docotr name in side cards
  useEffect(() => {
    if (!hospitalId) return;
    const fetchDoctors = async () => {
      try {
        const res = await api.get(`/receptionists/doctors/${hospitalId}`);
        setAllDoctors(res.data.doctors || []);
      } catch (error) {
        console.error("Failed to fetch doctor data:", error);
      }
    };
    fetchDoctors();
  }, [hospitalId]);

  useEffect(() => {
    if (!hospitalId) return;
    const fetchInitialData = async () => {
      try {
        const appointmentsRes = await api.get(
          `/api/appointments/hospital/${hospitalId}`
        );
        const formattedAppointments = appointmentsRes.data.map((apt) => {
          const startIso = `${apt.date}T${apt.slotStart}`;
          const endIso = `${apt.date}T${apt.slotEnd || apt.slotStart}`;
          const startMs = new Date(startIso).getTime();
          const endMs = new Date(endIso).getTime();
          return {
            ...apt,
            id: apt._id,
            patientName: apt.patientName || "Unknown Patient",
            patientId: apt.patientId,
            startMs,
            endMs,
            rawDate: apt.date,
            date: new Date(apt.date)
              .toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
              .replace(/\//g, "-"),
            slotStart: new Date(
              `1970-01-01T${apt.slotStart}`
            ).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
            slotEnd: new Date(`1970-01-01T${apt.slotEnd}`).toLocaleTimeString(
              "en-US",
              {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }
            ),
          };
        });
        setAllMeetings(formattedAppointments);

        const res = await api.get(
          `/api/appointments/departments/${hospitalId}`
        );
        setDepartments(
          Array.isArray(res.data.departments) ? res.data.departments : []
        );

        const patientsRes = await api.get(
          `/api/appointments/registerd-patients/${hospitalId}`
        );
        setPatients(patientsRes.data || []);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      }
    };

    fetchInitialData();
  }, [hospitalId]);

  const findDoctorName = (doctorValue) => {
    const docObj = allDoctors.find(
      d => d._id === doctorValue ||
        d.id === doctorValue ||
        d.doctor_id === doctorValue
    );
    return docObj?.name ?? doctorValue ?? "Unknown Doctor";
  };

  useEffect(() => {
    if (formData.date && formData.doctor) {
      const fetchSlots = async () => {
        try {
          const doctorMatch = doctors.find((d) => d.name === formData.doctor);
          const doctorId = doctorMatch?._id || doctorMatch?.id || doctorMatch?.doctorId;
          if (!doctorId || !formData.date) {
            setAvailableSlots([]);
            setError("Please select a valid doctor and date.");
            console.log("Fetch Slots blocked: doctorId or date missing", doctorId, formData.date);
            return;
          }
          // --- Add log: see what is actually called!
          console.log("Requesting:", `/api/appointments/availability/${doctorId}/${formData.date}`);

          const response = await api.get(
            `/api/appointments/availability/${doctorId}/${formData.date}`
          );
          const slots = Array.isArray(response.data)
            ? response.data
            : response.data?.slots || [];

          // **NEW: If slots are empty, show alert**
          if (!slots || slots.length === 0) {
            alert("Shifts are not set for this doctor on the selected date.");
            setAvailableSlots([]);
            return;
          }

          // ... slot sorting logic ...
          setAvailableSlots(slots);
        } catch (error) {
          // **NEW: If backend returns a 404 (no availability found), show alert!**
          if (error?.response?.status === 404) {
            alert("Shifts are not set for this doctor on the selected date.");
            setAvailableSlots([]);
          } else {
            console.error("Failed to fetch available slots", error);
            setAvailableSlots([]);
          }
        }
      };
      fetchSlots();
    } else {
      setAvailableSlots([]);
    }
  }, [formData.date, formData.doctor, doctors]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handlePatientNameChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, patientName: value, patientId: "" }));

    if (value.trim().length > 0) {
      const filtered = patients.filter((patient) => {
        const fullName = (
          patient.name ||
          `${patient.firstName || ""} ${patient.lastName || ""}`.trim()
        ).toLowerCase();
        return fullName.includes(value.toLowerCase());
      });
      setFilteredPatients(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredPatients([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectPatient = (patient) => {
    const patientName =
      patient.name ||
      `${patient.firstName || ""} ${patient.lastName || ""}`.trim();
    setFormData((prev) => ({
      ...prev,
      patientName: patientName,
      patientId: patient._id || patient.id,
    }));
    setShowSuggestions(false);
    setFilteredPatients([]);
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    if (name === "department") {
      setFormData((prev) => ({
        ...prev,
        department: value,
        doctor: "",
        date: "",
        startTime: "",
      }));
      if (value) {
        try {
          const response = await api.get("/api/appointments/doctors", {
            params: { hospitalId, department: value },
          });
          const payload = Array.isArray(response.data?.doctors)
            ? response.data.doctors
            : Array.isArray(response.data)
              ? response.data
              : [];
          setDoctors(payload || []);
        } catch (error) {
          setDoctors([]);
        }
      } else {
        setDoctors([]);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCompleteAppointment = (appointmentId) => {
    console.log(" Completing appointment with ID:", appointmentId);
    router.push(`/receptionist/billing?appointmentId=${appointmentId}`);
  };

  const handleScheduleMeeting = async (e) => {
    e.preventDefault();

    if (!formData.patientId || !formData.patientName || !formData.reason || !formData.department ||
      !formData.doctor || !formData.date || !formData.startTime) {
      alert("Please fill all fields and select a valid patient");
      return;
    }

    const doctorObj = doctors.find(
      (d) => d.name === formData.doctor || d._id === formData.doctor ||
        d.id === formData.doctor || d.doctor_id === formData.doctor
    );
    const doctorId = doctorObj?._id || doctorObj?.id || doctorObj?.doctor_id;

    if (!doctorId) {
      alert("Could not find doctor ID.");
      return;
    }

    const calculateEndTime = (startTime, durationMinutes = 30) => {
      const [hours, minutes] = startTime.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes + durationMinutes;
      const endHours = Math.floor(totalMinutes / 60);
      const endMinutes = totalMinutes % 60;
      return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
    };

    const endTime = calculateEndTime(formData.startTime, 30);

    const appointmentData = {
      hospitalId,
      doctorId,
      patientId: formData.patientId,
      patientName: formData.patientName,
      reason: formData.reason,
      department: formData.department,
      date: formData.date,
      slot: {
        start: formData.startTime,
        end: endTime
      },
      slotDuration: 30,
      sessionType: formData.sessionType,
      appointmentType: formData.appointmentType === "In-person" ? "manual" : "virtual",
    };

    try {
      const response = await api.post("/api/appointments/book", appointmentData);
      const newMeeting = response.data;

      setAllMeetings((prev) => [
        {
          ...newMeeting,
          id: newMeeting._id,
          patientName: newMeeting.patientName,
          rawDate: newMeeting.date,
          startMs: new Date(`${newMeeting.date}T${newMeeting.slotStart}`).getTime(),
          endMs: new Date(`${newMeeting.date}T${newMeeting.slotEnd}`).getTime(),
          date: new Date(newMeeting.date)
            .toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
            .replace(/\//g, "-"),
          slotStart: new Date(`1970-01-01T${newMeeting.slotStart}`)
            .toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
          slotEnd: new Date(`1970-01-01T${newMeeting.slotEnd}`)
            .toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
        },
        ...prev,
      ]);

      setFormData({
        patientId: "",
        patientName: "",
        reason: "",
        department: "",
        doctor: "",
        date: "",
        startTime: "",
        sessionType: "checkup",
        appointmentType: "In-person",
      });

      setTab("scheduled");
      alert("Appointment scheduled successfully!");
    } catch (error) {
      console.error("Failed to schedule appointment:", error);
      alert(
        `Failed to schedule appointment: ${error.response?.data?.message || error.message
        }`
      );
    }
  };

  // Centralized filtering and pagination logic
  useEffect(() => {
    const sourceMeetings = viewTab === "scheduled" ? scheduledMeetingsToShow : recentMeetingsToShow;
    const term = searchTerm.toLowerCase();

    const filtered = sourceMeetings.filter((m) => {
      if (!term) return true; // Show all if search is empty

      const patientName = (m.patientName || "").toLowerCase();
      const doctorName = findDoctorName(m.doctorId || m.doctorid || m.doctor).toLowerCase();
      // The date is already in DD-MM-YYYY format
      const appointmentDate = m.date.toLowerCase();

      switch (searchFilter) {
        case "patient":
          return patientName.includes(term);
        case "doctor":
          return doctorName.includes(term);
        case "date":
          return appointmentDate.includes(term);
        case "all":
        default:
          return (
            patientName.includes(term) ||
            doctorName.includes(term) ||
            appointmentDate.includes(term)
          );
      }
    });

    const currentPage = viewTab === "scheduled" ? currentPageScheduled : currentPageRecent;
    const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    
    setDisplayMeetings(paged);
  }, [searchTerm, searchFilter, viewTab, allMeetings, currentPageScheduled, currentPageRecent, allDoctors]);

  const today = new Date().toISOString().split("T")[0];
  const nowMs = Date.now();

  //const scheduledMeetingsToShow = allMeetings
  //.filter((m) => m.startMs && m.startMs >= nowMs && m.status !== "Cancelled")
  // .sort((a, b) => a.startMs - b.startMs);
  const scheduledMeetingsToShow = allMeetings
    .filter(
      (m) =>
        m.startMs &&
        m.startMs >= nowMs &&
        m.status !== "Cancelled" &&
        m.is_prescription === false
    )
    .sort((a, b) => a.startMs - b.startMs);

  // const recentMeetingsToShow = allMeetings
  //   .filter((m) => m.endMs && m.endMs < nowMs && m.status !== "Cancelled")
  //   .sort((a, b) => b.endMs - a.endMs);

  const recentMeetingsToShow = allMeetings
    .filter((m) =>
      (m.is_prescription === true || (m.endMs && m.endMs < nowMs)) &&
      m.status !== "Cancelled"
    )
    .sort((a, b) => b.endMs - a.endMs);


  const totalScheduledPages = Math.max(
    1,
    Math.ceil(scheduledMeetingsToShow.length / pageSize)
  );
  const totalRecentPages = Math.max(
    1, 
    Math.ceil(recentMeetingsToShow.filter(m => {
      // This filtering logic should match the one in the useEffect
      const term = searchTerm.toLowerCase();
      if (!term) return true;
      const patientName = (m.patientName || "").toLowerCase();
      const doctorName = findDoctorName(m.doctorId || m.doctorid || m.doctor).toLowerCase();
      const appointmentDate = m.date.toLowerCase();
      switch (searchFilter) {
        case "patient": return patientName.includes(term);
        case "doctor": return doctorName.includes(term);
        case "date": return appointmentDate.includes(term);
        default: return patientName.includes(term) || doctorName.includes(term) || appointmentDate.includes(term);
      }
    }).length / pageSize)
  );
  
  const resetPagination = () => {
    setCurrentPageScheduled(1);
    setCurrentPageRecent(1);
  };

  const openReschedule = async (appt) => {
    const isoDate =
      appt.rawDate || appt.date?.split("-").reverse().join("-") || today;
    try {
      const response = await api.get(
        `/api/appointments/availability/${appt.doctorId || appt.doctor_id || appt.doctor?._id}/${isoDate}`
      );
      const raw = Array.isArray(response.data)
        ? response.data
        : response.data?.slots || [];
      const toMinutes = (t) => {
        const [hh, mm] = (t || "0:0").split(":");
        return Number(hh) * 60 + Number(mm);
      };
      const slots = (raw || [])
        .filter((s) => s && (s.start || s.slotStart))
        .map((s) => ({
          slotStart: s.start || s.slotStart,
          slotEnd: s.end || s.slotEnd
        }))
        .sort((a, b) => toMinutes(a.slotStart) - toMinutes(b.slotStart))
        .filter((s, i, arr) => i === 0 || s.slotStart !== arr[i - 1].slotStart);
      setResModal({ open: true, appt, date: isoDate, slot: "", slots });
    } catch (e) {
      setResModal({ open: true, appt, date: isoDate, slot: "", slots: [] });
    }
  };

  const handleCancel = async (appt) => {
    if (!confirm("Cancel this appointment?")) return;
    try {
      await api.put(
        `/api/appointments/${appt.id || appt.appointmentId}/cancel`
      );
      await refreshAppointments();

      if (formData.date) {
        try {
          const doctorMatch = doctors.find((d) => d.name === formData.doctor);
          const doctorId =
            doctorMatch?._id || doctorMatch?.id || doctorMatch?.doctorId;
          if (doctorId) {
            const response = await api.get(
              `/api/appointments/availability/${doctorId}/${formData.date}`
            );
            const slots = Array.isArray(response.data)
              ? response.data
              : response.data?.slots || [];
            const toMinutes = (t) => {
              const [hh, mm] = (t || "0:0").split(":");
              return Number(hh) * 60 + Number(mm);
            };
            const sorted = (slots || [])
              .filter((s) => s && (s.start || s.slotStart))
              .map((s) => ({
                slotStart: s.start || s.slotStart,
                slotEnd: s.end || s.slotEnd
              }))
              .sort((a, b) => toMinutes(a.slotStart) - toMinutes(b.slotStart));
            setAvailableSlots(sorted);
          }
        } catch (_) { }
      }
      alert("Appointment cancelled");
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  };

  const refreshAppointments = async () => {
    try {
      const appointmentsRes = await api.get(
        `/api/appointments/hospital/${hospitalId}`
      );
      const formattedAppointments = appointmentsRes.data.map((apt) => {
        const startIso = `${apt.date}T${apt.slotStart}`;
        const endIso = `${apt.date}T${apt.slotEnd || apt.slotStart}`;
        return {
          ...apt,
          id: apt._id || apt.appointmentId || apt.id,
          rawDate: apt.date,
          patientId: apt.patientId,
          startMs: new Date(startIso).getTime(),
          endMs: new Date(endIso).getTime(),
          date: new Date(apt.date)
            .toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
            .replace(/\//g, "-"),
          slotStart: new Date(`1970-01-01T${apt.slotStart}`).toLocaleTimeString(
            "en-US",
            { hour: "2-digit", minute: "2-digit", hour12: true }
          ),
          slotEnd: new Date(`1970-01-01T${apt.slotEnd}`).toLocaleTimeString(
            "en-US",
            { hour: "2-digit", minute: "2-digit", hour12: true }
          ),
        };
      });
      setAllMeetings(formattedAppointments);
    } catch (_) { }
  };

  const submitReschedule = async () => {
    if (!resModal.appt || !resModal.date || !resModal.slot) {
      alert("Please select date and time");
      return;
    }
    try {
      await api.put(
        `/api/appointments/${resModal.appt.id || resModal.appt.appointmentId
        }/reschedule`,
        {
          date: resModal.date,
          newSlotStart: resModal.slot,
        }
      );
      setResModal({ open: false, appt: null, date: "", slot: "", slots: [] });
      await refreshAppointments();
      alert("Appointment rescheduled");
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  };

  const handleViewPrescription = async (appointment) => {
    try {
      const res = await api.get(`patient-records/${appointment.patientId}/appointment/${appointment.id}`);
      setPrescription(res.data.record ? [res.data.record] : []);
      setShowPrescription(true);
      setError('');
    } catch (err) {
      setPrescription([]);
      setShowPrescription(false);
      setError('No prescription found for this appointment.');
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Appointments
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and schedule patient appointments
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
            <div className="flex border-b border-gray-100">
              <button
                className={`flex-1 py-4 px-6 font-medium text-sm transition-all duration-200 ${mode === "book"
                  ? "text-blue-600 bg-blue-50 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                onClick={() => {
                  setMode("book");
                  resetPagination();
                }}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Book Appointment</span>
                </div>
              </button>
              <button
                className={`flex-1 py-4 px-6 font-medium text-sm transition-all duration-200 ${mode === "view"
                  ? "text-blue-600 bg-blue-50 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                onClick={() => {
                  setMode("view");
                  resetPagination();
                }}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>View Appointments</span>
                </div>
              </button>
            </div>

            <div className="p-6">
              {mode === "book" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white rounded-xl p-6">
                    <h2 className="text-xl font-semibold mb-6 text-gray-900 flex items-center space-x-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Schedule New Appointment</span>
                    </h2>
                    <form className="space-y-5" onSubmit={handleScheduleMeeting}>
                      <div className="relative" ref={suggestionRef}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Patient Name
                        </label>
                        <input
                          type="text"
                          name="patientName"
                          value={formData.patientName}
                          onChange={handlePatientNameChange}
                          onFocus={() => {
                            if (formData.patientName.trim().length > 0) {
                              setShowSuggestions(true);
                            }
                          }}
                          placeholder="Type patient name"
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          required
                          autoComplete="off"
                        />
                        {showSuggestions && filteredPatients.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {filteredPatients.map((patient) => (
                              <div
                                key={patient._id || patient.id}
                                onClick={() => handleSelectPatient(patient)}
                                className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-gray-900 border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                              >
                                {patient.name ||
                                  `${patient.firstName || ""} ${patient.lastName || ""
                                    }`.trim()}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Reason / Complaint
                        </label>
                        <input
                          type="text"
                          name="reason"
                          value={formData.reason}
                          onChange={handleInputChange}
                          placeholder="Reason for visit"
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Department
                        </label>
                        <select
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          required
                        >
                          <option value="">Select Department</option>
                          {Array.isArray(departments) && departments.map((deptName) => (
                            <option key={deptName} value={deptName}>{deptName}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Doctor
                        </label>
                        <select
                          name="doctor"
                          value={formData.doctor}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          disabled={!formData.department}
                          required
                        >
                          <option value="">Select Doctor</option>
                          {doctors.map((doc) => (
                             <option key={doc.id || doc._id || doc.doctorid} value={doc.name}>{doc.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          min={today}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          disabled={!formData.doctor}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Time
                        </label>
                        <select
                          name="startTime"
                          value={formData.startTime}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          disabled={!formData.date || availableSlots.length === 0}
                          required
                        >
                          <option value="">Select an available time</option>
                          {availableSlots
                            .filter(slot => {
                              // Compare slot's start time against current time
                              const now = new Date();
                              // Get date for selected appointment (use formData.date)
                              const appointmentDate = new Date(formData.date);
                              // Build full Date object for slot (use appointment date + slot.start)
                              const slotStartDate = new Date(
                                appointmentDate.getFullYear(),
                                appointmentDate.getMonth(),
                                appointmentDate.getDate(),
                                parseInt(slot.start.split(':')[0], 10),
                                parseInt(slot.start.split(':')[1], 10)
                              );
                              // Show only slots in the future
                              return slotStartDate > now;
                            })
                            .map((slot, idx) => (
                              <option key={slot.start} value={slot.start}>
                                {new Date(`1970-01-01T${slot.start}`).toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true
                                })}
                              </option>
                            ))}
                          {/* Handle case when no slots are available after filtering */}
                          {availableSlots.filter(slot => {
                              const now = new Date();
                              const appointmentDate = new Date(formData.date);
                              const slotStartDate = new Date(
                                appointmentDate.getFullYear(),
                                appointmentDate.getMonth(),
                                appointmentDate.getDate(),
                                parseInt(slot.start.split(':')[0], 10),
                                parseInt(slot.start.split(':')[1], 10)
                              );
                              return slotStartDate > now;
                            }).length === 0 && (
                              <option value="" disabled>
                                No available slots for selected date/time
                              </option>
                            )
                          }
                        </select>


                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Session Type
                          </label>
                          <select
                            name="sessionType"
                            value={formData.sessionType}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            required
                          >
                            <option value="checkup">Checkup</option>
                            <option value="followup">Followup</option>
                            <option value="therapy">Therapy</option>
                            <option value="consultation">Consultation</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Appointment Type
                          </label>
                          <select
                            name="appointmentType"
                            value={formData.appointmentType}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            required
                          >
                            <option value="In-person">In-person</option>
                            <option value="virtual">Virtual</option>
                          </select>
                        </div>
                      </div>

                      <div className="pt-4">
                        <button
                          type="submit"
                          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg shadow-sm hover:bg-blue-700 transition-all duration-200 flex items-center justify-center space-x-2 font-medium"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Schedule Appointment</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="bg-white rounded-xl p-6">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Upcoming Appointments</span>
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Next 5 scheduled appointments
                      </p>
                    </div>
                    <div className="space-y-4">
                      {scheduledMeetingsToShow.slice(0, 5).length > 0 ? (
                        scheduledMeetingsToShow.slice(0, 5).map((m) => (
                          <div
                            key={m.id}
                            className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-all duration-200 group"
                          >
                            <div className="flex items-start space-x-3">
                              <div className="p-2 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors duration-200">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-base font-semibold text-gray-900 truncate">
                                  {m.reason}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                  {m.patientName}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Dr. {findDoctorName(m.doctorId || m.doctorid || m.doctor)} • {m.date} at {m.slotStart}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-gray-500">No upcoming appointments</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {mode === "view" && (
                <div className="space-y-6">
                  <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                    <button
                      className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-all duration-200 ${viewTab === "scheduled"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                        }`}
                      onClick={() => {
                        setViewTab("scheduled");
                        setCurrentPageScheduled(1);
                      }}
                    >
                      Scheduled Appointments
                    </button>
                    <button
                      className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-all duration-200 ${viewTab === "recent"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                        }`}
                      onClick={() => {
                        setViewTab("recent");
                        setCurrentPageRecent(1);
                      }}
                    >
                      Recent Appointments
                    </button>
                  </div>

                  {/* 🔍 New Unified Search Bar */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
                    <div className="relative w-full sm:w-72">
                      <input
                        type="text"
                        placeholder={
                          searchFilter === "patient"
                            ? "Search by patient name..."
                            : searchFilter === "doctor"
                            ? "Search by doctor name..."
                            : searchFilter === "date"
                            ? "Search by date (DD-MM-YYYY)..."
                            : "Search by patient, doctor, or date..."
                        }
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 pl-10 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <i className="bi bi-search absolute left-3 top-2.5 text-gray-400 text-lg"></i>
                    </div>
                    <div className="relative">
                      <select
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg bg-white shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none w-full sm:w-auto"
                      >
                        <option value="all">All</option>
                        <option value="patient">Search by Patient Name</option>
                        <option value="doctor">Search by Doctor Name</option>
                        <option value="date">Search by Appointment Date</option>
                      </select>
                    </div>
                  </div>

                  {/* Modern Table Design */}
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Patient
                            </th>
                            <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Reason
                            </th>
                            <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Doctor
                            </th>
                            <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Date & Time
                            </th>
                            <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {displayMeetings.length > 0 ? (
                            displayMeetings.map((m) => (
                              <tr
                                key={m.id}
                                className="hover:bg-gray-50 transition-colors duration-150 group"
                              >
                                <td className="py-4 px-6">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                      <span className="text-sm font-medium text-blue-600">
                                        {m.patientName.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">
                                        {m.patientName}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-6">
                                  <p className="text-sm text-gray-900 max-w-xs truncate">
                                    {m.reason}
                                  </p>
                                </td>
                                <td className="py-4 px-6">
                                  <p className="text-sm text-gray-600">
                                    Dr. {findDoctorName(m.doctorId || m.doctorid || m.doctor)}
                                  </p>
                                </td>
                                <td className="py-4 px-6">
                                  <div className="text-sm text-gray-900 space-y-1">
                                    <p className="font-medium">{m.date}</p>
                                    <p className="text-gray-500">
                                      {m.slotStart} - {m.slotEnd}
                                    </p>
                                  </div>
                                </td>
                                <td className="py-4 px-6">
                                  <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${viewTab === "scheduled"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-green-100 text-green-800"
                                      }`}
                                  >
                                    {viewTab === "scheduled" ? (
                                      <>
                                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                                        Scheduled
                                      </>
                                    ) : (
                                      <>
                                        <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2"></span>
                                        Completed
                                      </>
                                    )}
                                  </span>
                                </td>
                                <td className="py-4 px-6">
                                  <div className="flex items-center space-x-2">
                                    {viewTab === "scheduled" && (
                                      <>
                                        <button
                                          onClick={() => openReschedule(m)}
                                          disabled={!(m.startMs >= Date.now())}
                                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          Reschedule
                                        </button>
                                        <button
                                          onClick={() => handleCancel(m)}
                                          disabled={!(m.startMs >= Date.now())}
                                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          Cancel
                                        </button>
                                      </>
                                    )}
                                    {viewTab === "recent" && (
                                      <div className="flex items-center space-x-2">
                                        <button
                                          onClick={() =>
                                            handleCompleteAppointment(m._id || m.id)
                                          }
                                          disabled={m.is_completed}
                                          className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg transition-colors duration-200 ${m.is_completed
                                            ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                                            : "text-green-600 bg-green-50 hover:bg-green-100"
                                            }`}
                                        >
                                          {m.is_completed ? "Completed" : "Complete"}
                                        </button>
                                        {m.is_prescription && (
                                          // <button onClick={() => andlheViewPrescription(m)}>Prescription</button>
                                          <button onClick={() => handleViewPrescription(m)}
                                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors duration-200"
                                          >
                                            Prescription
                                          </button>

                                        )}

                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan="6"
                                className="py-12 text-center"
                              >
                                <div className="flex flex-col items-center justify-center space-y-3">
                                  <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                  </svg>
                                  <p className="text-gray-500 text-sm">
                                    No {viewTab === "scheduled" ? "scheduled" : "recent"} appointments found
                                  </p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="bg-white px-6 py-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                          Showing{" "}
                          {displayMeetings.length > 0 ? ((viewTab === "scheduled" ? currentPageScheduled : currentPageRecent) - 1) * pageSize + 1 : 0}{" "}
                          to{" "}
                          {Math.min(
                            (viewTab === "scheduled" ? currentPageScheduled : currentPageRecent) * pageSize,
                            (viewTab === "scheduled" ? scheduledMeetingsToShow : recentMeetingsToShow).filter(m => displayMeetings.some(dm => dm.id === m.id)).length
                          )} of{" "}
                          {(viewTab === "scheduled" ? scheduledMeetingsToShow : recentMeetingsToShow).filter(m => displayMeetings.some(dm => dm.id === m.id)).length}{" "}
                          entries
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            disabled={viewTab === "scheduled" ? currentPageScheduled <= 1 : currentPageRecent <= 1}
                            onClick={() => {
                              if (viewTab === "scheduled") {
                                setCurrentPageScheduled((p) => Math.max(1, p - 1));
                              } else {
                                setCurrentPageRecent((p) => Math.max(1, p - 1));
                              }
                            }}
                          >
                            Previous
                          </button>
                          <span className="px-3 py-2 text-sm text-gray-700">
                            Page {viewTab === "scheduled" ? currentPageScheduled : currentPageRecent} of{" "}
                            {viewTab === "scheduled" ? totalScheduledPages : totalRecentPages}
                          </span>
                          <button
                            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            disabled={
                              viewTab === "scheduled"
                                ? currentPageScheduled >= totalScheduledPages
                                : currentPageRecent >= totalRecentPages
                            }
                            onClick={() => {
                              if (viewTab === "scheduled") {
                                setCurrentPageScheduled((p) => Math.min(totalScheduledPages, p + 1));
                              } else {
                                setCurrentPageRecent((p) => Math.min(totalRecentPages, p + 1));
                              }
                            }}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <RescheduleModal
        state={resModal}
        onClose={() =>
          setResModal({
            open: false,
            appt: null,
            date: "",
            slot: "",
            slots: [],
          })
        }
        onSubmit={submitReschedule}
        onChangeSlot={(val) => setResModal((p) => ({ ...p, slot: val }))}
      />

      {showPrescription && prescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-96 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Prescription Details
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {/* Support multiple prescriptions - one per patient */}
              {Array.isArray(prescription) && prescription.length > 0 ? (
                prescription.map((rec, idx) => (
                  <div key={idx} className="mb-6">
                    {/* Patient Info */}
                    <div className="text-sm font-semibold text-gray-800">
                      {/* {rec?.patient?.name || "Unknown"} */}
                      {rec?.patient?.email && (
                        <span className="font-bold mb-2 block">
                          {rec.patient.email}
                        </span>
                      )}
                    </div>

                    {/* Diagnosis */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Diagnosis
                      </label>
                      <p className="text-sm text-gray-900 bg-gray-50 rounded-lg px-3 py-2">
                        {rec?.diagnosis || "N/A"}
                      </p>
                    </div>
                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <p className="text-sm text-gray-900 bg-gray-50 rounded-lg px-3 py-2">
                        {rec?.notes || "N/A"}
                      </p>
                    </div>
                    {/* Medicines */}
                    {Array.isArray(rec?.prescription) && rec.prescription.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Medicines
                        </label>
                        <div className="space-y-2">
                          {rec.prescription.map((med, i) => (
                            <div key={i} className="bg-blue-50 rounded-lg p-3">
                              <p className="text-sm font-medium text-gray-900">
                                {med?.medicinename || med?.medicine_name || med?.name || "Medicine"}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {med?.dosage ? `${med.dosage} • ` : ""}
                                {med?.frequency ? `${med.frequency} • ` : ""}
                                {med?.duration || ""}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Recommended Tests */}
                    {Array.isArray(rec?.recommended_tests) && rec.recommended_tests.length > 0 && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Recommended Tests
                        </label>
                        <ul className="list-disc pl-5">
                          {rec.recommended_tests.map((test, i) => (
                            <li key={i} className="text-sm text-gray-800">{test}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <hr className="my-4" />
                  </div>
                ))
              ) : (
                <p>No prescription found for this appointment.</p>
              )}
            </div>
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowPrescription(false)}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RescheduleModal({ state, onClose, onSubmit, onChangeSlot }) {
  if (!state.open) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Reschedule Appointment</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={state.date}
              readOnly
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 text-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Start Time
            </label>
            {(state.slots || []).length > 0 ? (
              <select
                value={state.slot}
                onChange={(e) => onChangeSlot?.(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a time</option>
                {(state.slots || []).map((s) => (
                  <option key={s.slotStart} value={s.slotStart}>
                    {s.slotStart}
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2.5">
                No slots available for this date.
              </div>
            )}
          </div>
        </div>
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!state.slot}
            onClick={onSubmit}
          >
            Reschedule
          </button>
        </div>
      </div>
    </div>
  );
}