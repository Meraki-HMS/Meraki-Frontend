// "use client";
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import Sidebar from "@/components/Sidebar";
// import api from "@/utils/api";

// export default function RecentAppointmentsPaymentsPage() {
//   const router = useRouter();
//   const [completedMeetings, setCompletedMeetings] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [isMobile, setIsMobile] = useState(false);
//   const pageSize = 9;
//   const hospitalId = "HOSP01";

//   useEffect(() => {
//     async function fetchCompletedAppointments() {
//       try {
//         const appointmentsRes = await api.get(`/api/appointments/hospital/${hospitalId}`);
//         const formattedAppointments = appointmentsRes.data
//           .filter(apt => apt.status?.toLowerCase() === "completed")
//           .map(apt => ({
//             ...apt,
//             id: apt.id || apt._id,
//             patientName: apt.patientName || "Unknown Patient",
//             reason: apt.reason || "",
//             doctor: apt.doctor || "",
//             dateObj: new Date(apt.date),
//             slotStart: apt.slotStart,
//             slotEnd: apt.slotEnd,
//             status: "Completed",
//           }))
//           .sort((a, b) => b.dateObj - a.dateObj);

//         setCompletedMeetings(formattedAppointments);
//       } catch (error) {
//         console.error("Failed to fetch appointments", error);
//       }
//     }
//     fetchCompletedAppointments();
//   }, []);

//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 768);
//       if (window.innerWidth < 768) setSidebarOpen(false);
//     };
//     checkMobile();
//     window.addEventListener("resize", checkMobile);
//     return () => window.removeEventListener("resize", checkMobile);
//   }, []);

//   const totalPages = Math.max(1, Math.ceil(completedMeetings.length / pageSize));
//   const pagedCompleted = completedMeetings.slice((currentPage - 1) * pageSize, currentPage * pageSize);

//   function handleCompleteAppointment(appointmentId) {
//     router.push(`/receptionist/billing?appointmentId=${appointmentId}`);
//   }

//   function formatDate(dateObj) {
//     return dateObj.toLocaleDateString("en-GB");
//   }

//   function formatTime(timeStr) {
//     const d = new Date(`1970-01-01T${timeStr}`);
//     return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
//   }

//   return (
//     <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//       {isMobile && sidebarOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setSidebarOpen(false)} />
//       )}
//       <div
//         className={`
//           ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
//           ${isMobile ? "fixed inset-y-0 z-50 w-64" : "relative"}
//           transition-transform duration-300 ease-in-out
//         `}
//       >
//         <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
//       </div>

//       <main
//         className={`
//           flex-1 transition-all duration-300
//           ${sidebarOpen && !isMobile ? "ml-0" : "ml-0"}
//           min-h-screen
//         `}
//       >
//         <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 sticky top-0 z-30">
//           <div className="p-4 lg:p-6">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-4">
//                 <button
//                   onClick={() => setSidebarOpen(!sidebarOpen)}
//                   className="p-2 rounded-lg bg-white shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
//                 >
//                   <i className="bi bi-list text-xl text-gray-600"></i>
//                 </button>
//                 <div className="hidden sm:block">
//                   <h1 className="text-2xl font-bold text-gray-800">Payments</h1>
//                   <p className="text-sm text-gray-500">Completed appointments ready for billing</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="p-4 lg:p-6">
//           <div className="max-w-7xl mx-auto">
//             <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//               <div className="overflow-x-auto">
//                 <table className="w-full">
//                   <thead>
//                     <tr className="bg-gray-50 border-b border-gray-200">
//                       <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase">Patient</th>
//                       <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase">Reason</th>
//                       <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase">Doctor</th>
//                       <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
//                       <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase">Time</th>
//                       <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
//                       <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {pagedCompleted.length > 0 ? (
//                       pagedCompleted.map(m => (
//                         <tr key={m.id} className="hover:bg-gray-50 transition-colors duration-150">
//                           <td className="py-4 px-6">{m.patientName}</td>
//                           <td className="py-4 px-6">{m.reason}</td>
//                           <td className="py-4 px-6">{m.doctor}</td>
//                           <td className="py-4 px-6">{formatDate(m.dateObj)}</td>
//                           <td className="py-4 px-6">{`${formatTime(m.slotStart)} - ${formatTime(m.slotEnd)}`}</td>
//                           <td className="py-4 px-6">
//                             <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                               Completed
//                             </span>
//                           </td>
//                           <td className="py-4 px-6">
//                             <button
//                               onClick={() => handleCompleteAppointment(m.id)}
//                               className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-green-600 bg-green-50 hover:bg-green-100 transition-colors duration-200"
//                             >
//                               Complete
//                             </button>
//                           </td>
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td colSpan={7} className="py-12 text-center text-sm text-gray-500">
//                           No completed appointments found
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>

//               <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
//                 <button
//                   className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
//                   disabled={currentPage === 1}
//                   onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
//                 >
//                   Previous
//                 </button>
//                 <span className="px-3 py-2 text-sm text-gray-700">
//                   Page {currentPage} of {totalPages}
//                 </span>
//                 <button
//                   className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
//                   disabled={currentPage === totalPages}
//                   onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }
