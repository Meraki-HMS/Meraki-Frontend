// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";

// export default function LoginSelection() {
//   const router = useRouter();
//   const [role, setRole] = useState("doctor");

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     if (role === "admin") {
//       router.push("/admin/login");
//     } else if (role === "receptionist") {
//       router.push("/receptionist/login");
//     } else if (role === "lab") {
//       router.push("/login/labLogin"); // ✅ Correct route
//     } else {
//       router.push("/login/doctorLogin");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 p-4 relative overflow-hidden">
//       <div className="absolute inset-0 overflow-hidden">
//         <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
//         <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
//       </div>

//       <div className="max-w-4xl w-full bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 relative z-10 p-10 text-center">
//         <h1 className="text-4xl font-bold mb-4 text-gray-900">
//           Welcome to <span className="text-blue-600">Meraki HMS</span>
//         </h1>
//         <p className="text-gray-600 mb-8 text-lg">Choose your role to continue</p>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="flex justify-center gap-6 flex-wrap">
            
//             {/* Doctor */}
//             <button
//               type="button"
//               onClick={() => setRole("doctor")}
//               className={`flex flex-col items-center justify-center w-40 h-40 rounded-2xl border-2 transition-all duration-300 ${
//                 role === "doctor"
//                   ? "border-blue-600 bg-blue-50 shadow-lg"
//                   : "border-gray-200 hover:border-gray-400 bg-white"
//               }`}
//             >
//               <svg className="w-12 h-12 mb-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//                   d="M12 11c0-1.104.896-2 2-2h0a2 2 0 012 2v2a2 2 0 01-2 2h0a2 2 0 01-2-2v-2zm-6 9v-2a4 4 0 014-4h4a4 4 0 014 4v2"
//                 />
//               </svg>
//               <span className="font-semibold text-gray-800">Doctor</span>
//             </button>

//             {/* Admin */}
//             <button
//               type="button"
//               onClick={() => setRole("admin")}
//               className={`flex flex-col items-center justify-center w-40 h-40 rounded-2xl border-2 transition-all duration-300 ${
//                 role === "admin"
//                   ? "border-cyan-600 bg-cyan-50 shadow-lg"
//                   : "border-gray-200 hover:border-gray-400 bg-white"
//               }`}
//             >
//               <svg className="w-12 h-12 mb-2 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//                   d="M10 4v2m4-2v2m-9 4h14m-2 4h2m-2 4h2M4 14h2m-2 4h2m2-4h8m-8 4h8"
//                 />
//               </svg>
//               <span className="font-semibold text-gray-800">Admin</span>
//             </button>

//             {/* Receptionist */}
//             <button
//               type="button"
//               onClick={() => setRole("receptionist")}
//               className={`flex flex-col items-center justify-center w-40 h-40 rounded-2xl border-2 transition-all duration-300 ${
//                 role === "receptionist"
//                   ? "border-pink-600 bg-pink-50 shadow-lg"
//                   : "border-gray-200 hover:border-gray-400 bg-white"
//               }`}
//             >
//               <svg className="w-12 h-12 mb-2 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//                   d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m0-6l-9-5m9 5l9-5"
//                 />
//               </svg>
//               <span className="font-semibold text-gray-800">Receptionist</span>
//             </button>

//             {/* ✅ Lab */}
//             <button
//               type="button"
//               onClick={() => setRole("lab")}
//               className={`flex flex-col items-center justify-center w-40 h-40 rounded-2xl border-2 transition-all duration-300 ${
//                 role === "lab"
//                   ? "border-purple-600 bg-purple-50 shadow-lg"
//                   : "border-gray-200 hover:border-gray-400 bg-white"
//               }`}
//             >
//               <svg className="w-12 h-12 mb-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//                   d="M6 2v6l6 3 6-3V2M6 22v-6l6-3 6 3v6"
//                 />
//               </svg>
//               <span className="font-semibold text-gray-800">Lab</span>
//             </button>
//           </div>

//           <button
//             type="submit"
//             className="mt-8 w-full py-3.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
//           >
//             Continue to {role.charAt(0).toUpperCase() + role.slice(1)} Login
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import {
  Stethoscope,
  ShieldCheck,
  Users,
  FlaskConical,
  HeartPulse,
  Activity,
  Cross,
} from "lucide-react";

export default function LoginSelection() {
  const router = useRouter();
  const [role, setRole] = useState("doctor");

  const roles = [
    {
      key: "doctor",
      label: "Doctor",
      icon: Stethoscope,
      color: "from-blue-500 to-indigo-600",
    },
    {
      key: "admin",
      label: "Admin",
      icon: ShieldCheck,
      color: "from-cyan-500 to-teal-600",
    },
    {
      key: "receptionist",
      label: "Receptionist",
      icon: Users,
      color: "from-pink-500 to-rose-600",
    },
    {
      key: "lab",
      label: "Lab",
      icon: FlaskConical,
      color: "from-purple-500 to-violet-600",
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (role === "admin") router.push("/admin/login");
    else if (role === "receptionist") router.push("/receptionist/login");
    else if (role === "lab") router.push("/login/labLogin");
    else router.push("/login/doctorLogin");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 px-4">

      {/* GRID PATTERN */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* GRADIENT BLOBS */}
      <div className="absolute top-[-150px] left-[-150px] w-[500px] h-[500px] bg-blue-400 opacity-20 rounded-full blur-3xl animate-pulse"></div>

      <div className="absolute bottom-[-150px] right-[-150px] w-[500px] h-[500px] bg-purple-400 opacity-20 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-cyan-400 opacity-20 rounded-full blur-3xl animate-pulse delay-500"></div>

      {/* FLOATING ICONS */}
      <motion.div
        animate={{ y: [0, -25, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute top-20 left-20 text-blue-300 opacity-40"
      >
        <Stethoscope size={80} />
      </motion.div>

      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 7, repeat: Infinity }}
        className="absolute bottom-20 right-20 text-purple-300 opacity-40"
      >
        <FlaskConical size={80} />
      </motion.div>

      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute top-40 right-40 text-pink-300 opacity-40"
      >
        <HeartPulse size={70} />
      </motion.div>

      <motion.div
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute bottom-40 left-40 text-cyan-300 opacity-40"
      >
        <Activity size={70} />
      </motion.div>

      {/* MAIN CARD */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-5xl"
      >
        {/* Glow Behind Card */}
        <div className="absolute inset-0 bg-blue-500 opacity-10 blur-3xl rounded-3xl"></div>

        <div className="relative bg-white/70 backdrop-blur-2xl border border-white/40 shadow-2xl rounded-3xl p-12">

          {/* Header */}
          <div className="text-center mb-12">

            <motion.div
              initial={{ rotate: -10, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="flex justify-center mb-4"
            >
              <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-lg">
                <Cross size={32} />
              </div>
            </motion.div>

            <h1 className="text-5xl font-extrabold text-gray-800">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Meraki HMS
              </span>
            </h1>

            <p className="text-gray-600 mt-4 text-lg">
              Smart Hospital Management System
            </p>

          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit}>

            {/* ROLE GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

              {roles.map((item) => {
                const Icon = item.icon;
                const active = role === item.key;

                return (
                  <motion.button
                    key={item.key}
                    type="button"
                    whileHover={{ scale: 1.07 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setRole(item.key)}
                    className={`relative p-8 rounded-2xl transition-all duration-300 border
                    ${
                      active
                        ? "border-transparent shadow-2xl"
                        : "border-gray-200 bg-white hover:shadow-xl"
                    }`}
                  >

                    {/* Active Glow */}
                    {active && (
                      <motion.div
                        layoutId="activeGlow"
                        className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${item.color} opacity-10`}
                      />
                    )}

                    <div className="relative flex flex-col items-center">

                      <div
                        className={`p-4 rounded-xl bg-gradient-to-r ${item.color} text-white shadow-lg`}
                      >
                        <Icon size={32} />
                      </div>

                      <span className="mt-4 font-semibold text-gray-800 text-lg">
                        {item.label}
                      </span>

                    </div>

                  </motion.button>
                );
              })}

            </div>

            {/* BUTTON */}
            <motion.button
              whileHover={{
                scale: 1.03,
                boxShadow: "0px 10px 30px rgba(37,99,235,0.4)",
              }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="mt-12 w-full py-4 text-lg font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl transition-all duration-300"
            >
              Continue to{" "}
              {role.charAt(0).toUpperCase() + role.slice(1)} Login →
            </motion.button>

          </form>

        </div>
      </motion.div>

    </div>
  );
}