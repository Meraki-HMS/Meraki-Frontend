"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { usePathname } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_LAB_API_BASE || "http://localhost:3000";

export default function LabTopBar({ sidebarOpen, setSidebarOpen, user }) {
  const pathname = usePathname();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  // ✅ Fetch Lab Profile Image
  const fetchLabProfileImage = async () => {
    try {
      const hmsUser = JSON.parse(localStorage.getItem("hmsUser"));
      const token = hmsUser?.token;

      if (!token) return;

      const res = await axios.get(`${API_BASE_URL}/labs/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProfileImage(res.data?.lab?.profileImage || null);
    } catch (err) {
      console.error("❌ Error fetching lab profile image:", err);
    }
  };

  useEffect(() => {
    fetchLabProfileImage();
  }, []);

  const displayName = (() => {
    if (user?.name && user.name.trim()) return user.name;
    if (user?.email) return user.email.split("@")[0];
    return "Lab User";
  })();

  const notifications = [
    {
      id: 1,
      type: "report",
      message: "New test assigned",
      time: "5 min ago",
      read: false,
    },
    {
      id: 2,
      type: "update",
      message: "Report uploaded successfully",
      time: "1 hour ago",
      read: true,
    },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 sticky top-0 z-30 shadow-sm">
      <div className="px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">

          {/* LEFT */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2.5 rounded-xl bg-white shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 text-gray-600 hover:text-purple-600"
            >
              <i className="bi bi-list text-xl"></i>
            </button>

            <div className="hidden md:block">
              <h1 className="text-2xl font-bold text-gray-800 capitalize">
                {pathname.replace("/lab/", "").replace("-", " ") ||
                  "Lab Dashboard"}
              </h1>
              <p className="text-sm text-gray-500">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3">

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-purple-600"
              >
                <i className="bi bi-bell text-xl"></i>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* PROFILE */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl shadow-sm border border-gray-200"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border shadow">
                  {/* <img
                    src={profileImage || "/default-lab.png"}
                    alt="Lab"
                    className="w-full h-full object-cover"
                    onError={(e) =>
                      (e.currentTarget.src = "/default-lab.png")
                    }
                  /> */}
                </div>

                <div className="hidden lg:block text-left">
                  <span className="block text-gray-800 font-medium">
                    {displayName}
                  </span>
                  <span className="block text-xs text-gray-500">
                    Laboratory
                  </span>
                </div>

                <i className="bi bi-chevron-down text-gray-400 hidden lg:block"></i>
              </button>

              {/* DROPDOWN */}
              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b">
                    <div className="flex items-center gap-3">
                      {/* <img
                        src={profileImage || "/default-lab.png"}
                        className="w-10 h-10 rounded-full object-cover border"
                        alt="Lab"
                      /> */}
                      <div>
                        <p className="font-semibold text-gray-800">
                          {displayName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {user?.email || ""}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={() => (window.location.href = "/lab/profile")}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-lg flex gap-2"
                    >
                      <i className="bi bi-person"></i> My Profile
                    </button>
                  </div>

                  <div className="p-2 border-t">
                    <button
                      onClick={() => {
                        localStorage.clear();
                        window.location.href = "/login";
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex gap-2"
                    >
                      <i className="bi bi-box-arrow-right"></i> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {(showNotifications || showProfileMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowNotifications(false);
            setShowProfileMenu(false);
          }}
        />
      )}
    </header>
  );
}
