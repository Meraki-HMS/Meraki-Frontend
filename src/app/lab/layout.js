"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLabAuth } from "../../hooks/useLabAuth";
import LabSidebar from "@/components/lab/layout/LabSidebar";
import LabTopBar from "@/components/lab/layout/LabTopBar";

export default function LabLayout({ children }) {
  const { user, loading, isAuthenticated } = useLabAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/lab/login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading Lab Portal...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <LabSidebar open={sidebarOpen} setOpen={setSidebarOpen} user={user} />
      <div className="flex-1 flex flex-col">
        <LabTopBar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          user={user}
        />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
