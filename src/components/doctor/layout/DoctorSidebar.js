"use client";
import { DoctorModuleContext } from "@/app/doctor/DoctorModuleContext";
import { useContext } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function DoctorSidebar({ open, setOpen }) {
  const router = useRouter();
  const pathname = usePathname();

  // ✅ Get doctor data from context
  const { user, appointments, prescriptionContext } = useContext(DoctorModuleContext);

  //console.log("DoctorModuleContext Data:", { user, appointments, prescriptionContext });

  const menuItems = [
    { id: "dashboard", icon: "bi bi-speedometer2", label: "Dashboard", route: "/doctor/dashboard" },
    { id: "patients", icon: "bi bi-people-fill", label: "My Patients", route: "/doctor/patients" },
    { id: "appointments", icon: "bi bi-calendar-check", label: "Appointments", route: "/doctor/appointments" },
    // { id: "complete-appointments", icon: "bi bi-check2-circle", label: "Complete Appointments", route: "/doctor/complete-appointments" },
    // { id: "prescriptions", icon: "bi bi-file-medical", label: "Prescriptions", route: "/doctor/prescriptions" },
  ];

  return (
    <div
      className={`${
        open ? "w-64" : "w-20"
      } bg-white/95 backdrop-blur-sm border-r border-gray-200/60 h-screen transition-all duration-300 flex flex-col sticky top-0 shadow-xl`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center p-4 lg:p-6 border-b border-gray-200/60">
        <div
          className={`flex items-center gap-3 transition-opacity ${
            open ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <i className="bi bi-heart-pulse text-white text-xl"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Doctor Portal</h1>
            <p className="text-xs text-gray-500">Medical Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.route;
          return (
            <button
              key={item.id}
              onClick={() => router.push(item.route)}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
                ${
                  isActive
                    ? "bg-blue-50/80 border border-blue-200/60 text-blue-600 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50/80 hover:text-gray-800"
                }
              `}
            >
              <div
                className={`
                  p-2 rounded-lg transition-colors duration-200
                  ${
                    isActive
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-500 group-hover:bg-blue-50"
                  }
                `}
              >
                <i className={`${item.icon} text-lg`}></i>
              </div>
              {open && <span className="font-medium flex-1 text-left">{item.label}</span>}
              {isActive && open && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
            </button>
          );
        })}
      </nav>

      {/* ✅ User Profile Section (Dynamic) */}
      <div className="p-4 border-t border-gray-200/60">
        <div
          className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-white transition-opacity ${
            open ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">
              {user?.name ? user.name.charAt(0).toUpperCase() : "D"}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-800">
               {user?.name || "Doctor"}
            </p>
            <p className="text-xs text-gray-500">
              {user?.specialization || "General Physician"}
            </p>
            <p className="text-xs text-blue-600 font-medium">• Online</p>
          </div>
        </div>
      </div>
    </div>
  );
}
