"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DoctorModuleContext } from "./DoctorModuleContext";
import DoctorSidebar from "../../components/doctor/layout/DoctorSidebar";
import DoctorTopBar from "../../components/doctor/layout/DoctorTopBar";
import { useDoctorAuth } from "../../hooks/useDoctorAuth";
import { useMobileDetection } from "../../hooks/useMobileDetection";
import {
  getDoctorAppointments,
  getDoctorProfile,
} from "../../services/doctorAppointmentsApi";

export default function DoctorLayout({ children }) {
  const { user, loading, isAuthenticated } = useDoctorAuth();
  const { isMobile } = useMobileDetection();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const router = useRouter();

  const [appointments, setAppointments] = useState([]);
  const [profile, setProfile] = useState(null);
  const [prescriptionContext, setPrescriptionContext] = useState(null);
  const [prescriptionTab, setPrescriptionTab] = useState("history"); // history | new

  // Fetch appointments
  useEffect(() => {
    const load = async () => {
      if (!user) return;

      try {
        const res = await getDoctorAppointments({
          hospitalId: user.hospitalId,
          doctorId: user.doctorid,
        });

        const list = (res.appointments || []).map((a) => ({
          id: a._id,
          patientId: a.patientId || a._id,
          patientEmail: a.patientEmail || "",
          patientName: a.patientName || a.patient_name || "",
          date: a.date?.slice(0, 10) || "",
          slotStart: a.slotStart || "",
          slotEnd: a.slotEnd || "",
          time:
            a.slotStart && a.slotEnd
              ? `${a.slotStart} - ${a.slotEnd}`
              : a.time || "",
          type: (a.appointmentType || "walk-in").toLowerCase(),
          sessionType: a.sessionType || a.reason || "Consultation",
          status: (a.status || "scheduled").toLowerCase(),
          patientDetails: {
            age: a.age || "",
            gender: a.gender || "",
            contact: a.contact || "",
            email: a.patientEmail || "",
            sessionType: a.sessionType || "",
            medicalHistoryFiles: [],
          },
        }));

        setAppointments(list);
      } catch (e) {
        console.error("Failed to load appointments", e);
      }
    };

    load();
  }, [user]);

  // Fetch doctor profile
  useEffect(() => {
  const loadProfile = async () => {
    try {
      const res = await getDoctorProfile();
      console.log("Doctor Profile API Response:", res);
      setProfile(res?.doctor || res || null);
    } catch (e) {
      console.error("Failed to load profile", e);
    }
  };
  if (isAuthenticated) loadProfile();
}, [isAuthenticated]);


  // Navigate to prescription page and open "new" form
  const handleNavigateToPrescription = (patientData) => {
    setPrescriptionContext(patientData);
    setPrescriptionTab("new");

    if (typeof window !== "undefined") {
      localStorage.setItem("prescriptionContext", JSON.stringify(patientData));
      localStorage.setItem("prescriptionTab", "new");
      router.push("/doctor/prescriptions");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading Doctor Portal...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (typeof window !== "undefined") router.push("/login");
    return null;
  }

  return (
    <DoctorModuleContext.Provider
      value={{
        handleNavigateToPrescription,
        appointments,
        setAppointments,
        prescriptionContext,
        setPrescriptionContext,
        prescriptionTab,
        setPrescriptionTab,
        user: profile
          ? {
              ...user,
              name: profile?.name || user?.email?.split("@")[0],
              specialization: profile?.specialization || "General Physician",
            }
          : user,
      }}
    >
      <div className="flex min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
        {/* Mobile overlay */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} ${
            isMobile ? "fixed inset-y-0 z-50 w-64" : "relative"
          } transition-transform duration-300 ease-in-out`}
        >
          <DoctorSidebar
            open={sidebarOpen}
            setOpen={setSidebarOpen}
            user={
              profile
                ? { ...user, name: profile?.name || user?.email?.split("@")[0] }
                : user
            }
          />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          <DoctorTopBar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            user={
              profile
                ? { ...user, name: profile?.name || user?.email?.split("@")[0],specialization: profile?.specialization || "General Physician", }
                : user
            }
          />
          <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </DoctorModuleContext.Provider>
  );
}