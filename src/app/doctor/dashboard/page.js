"use client";

import { useEffect, useState } from "react";
import StatCards from "../../../components/doctor/dashboard/StatCards";
import TodaySchedule from "../../../components/doctor/dashboard/TodaySchedule";
import { useDoctorAuth } from "../../../hooks/useDoctorAuth";
import axios from "axios";

export default function DoctorDashboard() {
  const { user } = useDoctorAuth();
  const [doctorName, setDoctorName] = useState("");

  const DOCTOR_API = process.env.NEXT_PUBLIC_DOCTOR_API_BASE || "http://localhost:3000";

  useEffect(() => {
    if (!user?.doctorid) return;

    axios
      .get(`${DOCTOR_API}/doctors/${user.doctorid}`)
      .then((res) => {
        setDoctorName(res.data.doctor?.name || "");
      })
      .catch((err) => {
        console.log("Error fetching doctor:", err);
      });
  }, [user]);

  return (
    <>
      {/* Welcome Section */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
          Welcome back
          {doctorName
            ? " " + doctorName
            : user?.email
            ? ", Dr. " + user.email.split("@")[0]
            : ", Doctor"}
        </h1>
        <p className="text-gray-600 mt-2">Here&apos;s your schedule for today.</p>
      </div>

      {/* Stat Cards Grid */}
      <div className="mb-6 lg:mb-8">
        <StatCards />
      </div>

      {/* Today's Schedule */}
      <div className="mb-6 lg:mb-8">
        <TodaySchedule />
      </div>
    </>
  );
}
