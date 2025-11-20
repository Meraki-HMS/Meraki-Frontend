"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";

export default function Topbar({ onMenuClick }) {
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const userString = localStorage.getItem("hmsUser");
    if (userString) {
      try {
        setUser(JSON.parse(userString));
      } catch {
        setUser(null);
      }
    }
  }, []);

  // Handle outside click for profile menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const notifications = [
    {
      id: 1,
      type: "alert",
      message: "New lab report available",
      time: "10 min ago",
      read: false,
    },
    // Add more notifications as needed
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  const displayName =
    user?.name && user.name.trim().length > 0 ? user.name : "Receptionist";
  const displayRole = user?.role || "Receptionist";
  const initials = (() => {
    if (user?.name && user.name.trim().length > 0) {
      const parts = user.name.trim().split(" ");
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
      return parts[0].slice(0, 2).toUpperCase();
    }
    return "RE";
  })();

  const handleSignOut = () => {
    localStorage.removeItem("hmsUser");
    window.location.href = "/login";
  };

  return (
    <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 sticky top-0 z-30">
      <div className="p-4 lg:p-6">
        <div className="flex items-center justify-between">
          {/* Left: Menu Button and Breadcrumb */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="p-2.5 rounded-xl bg-white/60 backdrop-blur-sm border border-gray-200/60 hover:shadow-md transition-all duration-200 text-gray-600 hover:text-blue-600"
            >
              <div className="bi bi-list text-xl" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-sm text-gray-500">
                Welcome back, {displayName}
              </p>
            </div>
          </div>

          {/* Center: Search Bar */}
          <div className="flex-1 max-w-2xl mx-4 lg:mx-8">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search patients, conditions, medications..."
                className="w-full px-6 py-3 rounded-2xl border border-gray-300 bg-white/80 backdrop-blur-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:shadow-md"
              />
              <span className="absolute right-4 top-3 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300">
                <i className="bi bi-search text-lg" />
              </span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 rounded-xl bg-white/60 backdrop-blur-sm border border-gray-200/60 text-gray-600 hover:text-blue-600 hover:shadow-md transition-all duration-200"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                    {unreadCount}
                  </span>
                )}
              </button>
              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800">Notifications</h3>
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        {unreadCount} unread
                      </span>
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                          !notification.read ? "bg-blue-50" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              notification.type === "alert"
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-blue-100 text-blue-600"
                            }`}
                          >
                            <i
                              className={`bi bi-${
                                notification.type === "alert"
                                  ? "exclamation-triangle"
                                  : "info-circle"
                              } text-sm`}
                            ></i>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500">
                              {notification.time}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-gray-200">
                    <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-2.5 rounded-2xl shadow-sm hover:shadow-md border border-gray-200/60 transition-all duration-200"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-semibold text-sm">{initials}</span>
                </div>
                <div className="text-left">
                  <span className="block text-gray-800 font-medium">
                    {displayName}
                  </span>
                  <span className="block text-xs text-gray-500">
                    {displayRole}
                  </span>
                </div>
                <i className="bi bi-chevron-down text-gray-400 hidden lg:block"></i>
              </button>
              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <p className="font-semibold text-gray-800">{displayName}</p>
                    <p className="text-sm text-gray-500">{user?.email || ""}</p>
                    <p className="text-xs text-blue-600 font-medium mt-1">● Online</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        router.push("/receptionist/profile");
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 text-gray-800 rounded-t-xl transition"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 text-gray-800 transition rounded-b-xl"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
