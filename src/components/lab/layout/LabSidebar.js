"use client";

import { useRouter, usePathname } from "next/navigation";

export default function LabSidebar({ open, setOpen, user }) {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      route: "/lab/dashboard",
      icon: "bi bi-speedometer2",
    },
    {
      id: "past-reports",
      label: "Past Lab Reports",
      route: "/lab/past-reports",
      icon: "bi bi-file-earmark-medical",
    },
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
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <i className="bi bi-activity text-white text-xl"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Lab Portal</h1>
            <p className="text-xs text-gray-500">Diagnostics Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
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
                    ? "bg-purple-50/80 border border-purple-200/60 text-purple-600 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50/80 hover:text-gray-800"
                }
              `}
            >
              <div
                className={`
                  p-2 rounded-lg transition-colors duration-200
                  ${
                    isActive
                      ? "bg-purple-100 text-purple-600"
                      : "bg-gray-100 text-gray-500 group-hover:bg-purple-50"
                  }
                `}
              >
                <i className={`${item.icon} text-lg`}></i>
              </div>

              {open && (
                <span className="font-medium flex-1 text-left">
                  {item.label}
                </span>
              )}

              {isActive && open && (
                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200/60">
        <div
          className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-white transition-opacity ${
            open ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">
              {user?.email
                ? user.email.charAt(0).toUpperCase()
                : "L"}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-800">
              {user?.email?.split("@")[0] || "Lab User"}
            </p>
            <p className="text-xs text-gray-500">
              Laboratory Staff
            </p>
            <p className="text-xs text-purple-600 font-medium">
              • Online
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
