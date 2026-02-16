"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./components/Sidebar";

export default function AdminLayout({ children }) {
  const pathname = usePathname();   // 👈 detect current route

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Hide sidebar for login route
  if (pathname === "/admin/login") {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div className="flex min-h-screen">
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${isMobile ? "fixed inset-y-0 z-50 w-64" : "relative"}
        transition-transform duration-300 ease-in-out`}
      >
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      </div>

      <main className="flex-1">{children}</main>
    </div>
  );
}
