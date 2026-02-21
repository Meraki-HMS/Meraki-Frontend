// "use client";

// import { useState, useEffect } from "react";
// import { useLabAuth } from "../../../hooks/useLabAuth";
// import axios from "axios";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   PlusCircle,
//   X,
//   User,
//   Mail,
//   Phone,
//   Search,
// } from "lucide-react";

// const API_BASE =
//   process.env.NEXT_PUBLIC_LAB_API_BASE || "http://localhost:3000";

// export default function LabDashboard() {

//   const { user } = useLabAuth();

//   const [showForm, setShowForm] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [searching, setSearching] = useState(false);
//   const [patientFound, setPatientFound] = useState(null);

//   const commonTests = [
//     "Complete Blood Count (CBC)",
//     "Blood Test",
//     "MRI",
//     "CT Scan",
//     "X-Ray",
//     "Urine Test",
//     "Liver Function Test"
//   ];

//   const [formData, setFormData] = useState({

//     identifier: "",

//     patientName: "",
//     patientEmail: "",
//     patientContact: "",

//     selectedTests: [], // ✅ MULTIPLE TESTS

//     remarks: "",
//     reportFile: null,

//   });

//   /* LOCK BACKGROUND SCROLL */
//   useEffect(() => {
//     document.body.style.overflow = showForm ? "hidden" : "auto";
//   }, [showForm]);

//   /* INPUT CHANGE */
//   const handleChange = (e) => {

//     const { name, value, files } = e.target;

//     if (name === "reportFile") {

//       setFormData(prev => ({
//         ...prev,
//         reportFile: files[0]
//       }));

//     } else {

//       setFormData(prev => ({
//         ...prev,
//         [name]: value
//       }));

//     }

//   };

//   /* TOGGLE TEST CHECKBOX */
//   const toggleTest = (test) => {

//     setFormData(prev => {

//       const exists = prev.selectedTests.includes(test);

//       if (exists) {
//         return {
//           ...prev,
//           selectedTests:
//             prev.selectedTests.filter(t => t !== test)
//         };
//       }

//       return {
//         ...prev,
//         selectedTests: [...prev.selectedTests, test]
//       };

//     });

//   };

//   /* SEARCH PATIENT */
//   const searchPatient = async () => {

//     try {

//       const hmsUser =
//         JSON.parse(localStorage.getItem("hmsUser"));

//       const token = hmsUser?.token;

//       if (!formData.identifier) {
//         alert("Enter patient email");
//         return;
//       }

//       setSearching(true);

//       const res = await axios.get(
//         `${API_BASE}/lab-reports/email/${formData.identifier}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`
//           }
//         }
//       );

//       const patient = res.data.patient;
//       const record = res.data.record;

//       setFormData(prev => ({

//         ...prev,

//         patientEmail: patient.email || "",

//         patientName:
//           record?.patient_id?.name || "",

//         patientContact:
//           record?.patient_id?.mobile || "",

//         // ✅ AUTOFILL MULTIPLE TESTS
//         selectedTests:
//           record?.recommended_tests || [],

//         remarks:
//           record?.diagnosis || ""

//       }));

//       setPatientFound(true);

//     }
//     catch {

//       setPatientFound(false);

//     }
//     finally {

//       setSearching(false);

//     }

//   };

//   /* SUBMIT */
//   const handleSubmit = async (e) => {

//     e.preventDefault();

//     try {

//       const hmsUser =
//         JSON.parse(localStorage.getItem("hmsUser"));

//       const token = hmsUser?.token;

//       const fd = new FormData();

//       fd.append("patientName", formData.patientName);

//       fd.append("patientEmail", formData.patientEmail);

//       fd.append("patientContact", formData.patientContact);

//       // ✅ SEND MULTIPLE TESTS
//       fd.append(
//         "testName",
//         JSON.stringify(formData.selectedTests)
//       );

//       fd.append("remarks", formData.remarks);

//       fd.append("hospital_id", hmsUser.hospitalId);

//       fd.append("lab_id", hmsUser.labid);

//       fd.append("reportFile", formData.reportFile);

//       setLoading(true);

//       await axios.post(
//         `${API_BASE}/lab-reports/create`,
//         fd,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`
//           }
//         }
//       );

//       alert("Report Uploaded Successfully");

//       setShowForm(false);

//     }
//     catch {

//       alert("Upload failed");

//     }
//     finally {

//       setLoading(false);

//     }

//   };

//   return (

//     <div className="p-6">

//       <button
//         onClick={() => setShowForm(true)}
//         className="bg-purple-600 text-white px-6 py-3 rounded-xl flex gap-2"
//       >
//         <PlusCircle size={18}/>
//         Add Report
//       </button>

//       <AnimatePresence>

//         {showForm && (

//           <motion.div
//             className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4"
//           >

//             <motion.div
//               className="bg-white w-full max-w-lg rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto"
//             >

//               <button
//                 onClick={() => setShowForm(false)}
//                 className="absolute right-4 top-4"
//               >
//                 <X/>
//               </button>

//               <h2 className="text-xl font-bold mb-4">
//                 Add Lab Report
//               </h2>

//               {/* SEARCH */}
//               <div className="flex gap-2 mb-3">

//                 <input
//                   name="identifier"
//                   value={formData.identifier}
//                   onChange={handleChange}
//                   placeholder="Enter patient email"
//                   className="flex-1 border px-3 py-2 rounded-lg"
//                 />

//                 <button
//                   onClick={searchPatient}
//                   className="bg-blue-600 text-white px-4 rounded-lg flex items-center gap-1"
//                 >
//                   <Search size={16}/>
//                   {searching ? "..." : "Search"}
//                 </button>

//               </div>

//               {patientFound === true &&
//                 <p className="text-green-600">
//                   ✔ Patient Found
//                 </p>
//               }

//               {patientFound === false &&
//                 <p className="text-red-600">
//                   ✘ New Patient
//                 </p>
//               }

//               {/* FORM */}
//               <form
//                 onSubmit={handleSubmit}
//                 className="space-y-3"
//               >

//                 <Input
//                   icon={<User size={16}/>}
//                   name="patientName"
//                   value={formData.patientName}
//                   onChange={handleChange}
//                   placeholder="Patient Name"
//                 />

//                 <Input
//                   icon={<Mail size={16}/>}
//                   name="patientEmail"
//                   value={formData.patientEmail}
//                   onChange={handleChange}
//                   placeholder="Email"
//                 />

//                 <Input
//                   icon={<Phone size={16}/>}
//                   name="patientContact"
//                   value={formData.patientContact}
//                   onChange={handleChange}
//                   placeholder="Contact"
//                 />

//                 {/* MULTI TEST SELECT */}
//                 <div>

//                   <label className="font-medium">
//                     Select Tests
//                   </label>

//                   <div className="border rounded-lg p-2 max-h-40 overflow-y-auto">

//                     {commonTests.map(test => {

//                       const checked =
//                         formData.selectedTests.includes(test);

//                       return (

//                         <label
//                           key={test}
//                           className="flex gap-2 items-center"
//                         >

//                           <input
//                             type="checkbox"
//                             checked={checked}
//                             onChange={() => toggleTest(test)}
//                           />

//                           {test}

//                         </label>

//                       );

//                     })}

//                   </div>

//                 </div>

//                 <input
//                   type="file"
//                   name="reportFile"
//                   onChange={handleChange}
//                   required
//                 />

//                 <textarea
//                   name="remarks"
//                   value={formData.remarks}
//                   onChange={handleChange}
//                   className="w-full border rounded-lg px-3 py-2"
//                   placeholder="Remarks"
//                 />

//                 <button
//                   className="w-full bg-purple-600 text-white py-2 rounded-lg"
//                   disabled={loading}
//                 >
//                   {loading
//                     ? "Uploading..."
//                     : "Submit"}
//                 </button>

//               </form>

//             </motion.div>

//           </motion.div>

//         )}

//       </AnimatePresence>

//     </div>

//   );

// }

// function Input({ icon, ...props }) {

//   return (
//     <div className="relative">

//       <div className="absolute left-2 top-2 text-gray-400">
//         {icon}
//       </div>

//       <input
//         {...props}
//         className="w-full border rounded-lg pl-8 pr-2 py-2"
//       />

//     </div>
//   );

// }
"use client";

import { useState, useEffect } from "react";
import { useLabAuth } from "../../../hooks/useLabAuth";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

import {
  PlusCircle,
  X,
  User,
  Mail,
  Phone,
  Search,
  UploadCloud,
  FileText,
} from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_LAB_API_BASE || "http://localhost:3000";

export default function LabDashboard() {

  const { user } = useLabAuth();

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [patientFound, setPatientFound] = useState(null);

  const commonTests = [
    "Complete Blood Count (CBC)",
    "Blood Test",
    "MRI",
    "CT Scan",
    "X-Ray",
    "Urine Test",
    "Liver Function Test"
  ];

  const [formData, setFormData] = useState({

    identifier: "",

    patientName: "",
    patientEmail: "",
    patientContact: "",

    selectedTests: [],

    remarks: "",
    reportFile: null,

  });

  useEffect(() => {
    document.body.style.overflow = showForm ? "hidden" : "auto";
  }, [showForm]);

  const handleChange = (e) => {

    const { name, value, files } = e.target;

    if (name === "reportFile") {

      setFormData(prev => ({
        ...prev,
        reportFile: files[0]
      }));

    } else {

      setFormData(prev => ({
        ...prev,
        [name]: value
      }));

    }

  };

  const toggleTest = (test) => {

    setFormData(prev => {

      const exists = prev.selectedTests.includes(test);

      if (exists) {
        return {
          ...prev,
          selectedTests:
            prev.selectedTests.filter(t => t !== test)
        };
      }

      return {
        ...prev,
        selectedTests: [...prev.selectedTests, test]
      };

    });

  };

  const searchPatient = async () => {

    try {

      const hmsUser =
        JSON.parse(localStorage.getItem("hmsUser"));

      const token = hmsUser?.token;

      if (!formData.identifier) {
        alert("Enter patient email");
        return;
      }

      setSearching(true);

      const res = await axios.get(
        `${API_BASE}/lab-reports/email/${formData.identifier}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const patient = res.data.patient;
      const record = res.data.record;

      setFormData(prev => ({

        ...prev,

        patientEmail: patient.email || "",

        patientName:
          record?.patient_id?.name || "",

        patientContact:
          record?.patient_id?.mobile || "",

        selectedTests:
          record?.recommended_tests || [],

        remarks:
          record?.diagnosis || ""

      }));

      setPatientFound(true);

    }
    catch {

      setPatientFound(false);

    }
    finally {

      setSearching(false);

    }

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const hmsUser =
        JSON.parse(localStorage.getItem("hmsUser"));

      const token = hmsUser?.token;

      const fd = new FormData();

      fd.append("patientName", formData.patientName);
      fd.append("patientEmail", formData.patientEmail);
      fd.append("patientContact", formData.patientContact);

      fd.append(
        "testName",
        JSON.stringify(formData.selectedTests)
      );

      fd.append("remarks", formData.remarks);

      fd.append("hospital_id", hmsUser.hospitalId);
      fd.append("lab_id", hmsUser.labid);

      fd.append("reportFile", formData.reportFile);

      setLoading(true);

      await axios.post(
        `${API_BASE}/lab-reports/create`,
        fd,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Report Uploaded Successfully");

      setShowForm(false);

    }
    catch {

      alert("Upload failed");

    }
    finally {

      setLoading(false);

    }

  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 p-8">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Lab Dashboard
          </h1>

          <p className="text-gray-500">
            Upload and manage patient reports
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl flex gap-2 items-center shadow-lg hover:shadow-xl transition"
        >
          <PlusCircle size={18}/>
          Add Report
        </motion.button>

      </div>

      {/* MODAL */}
      <AnimatePresence>

        {showForm && (

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4"
          >

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white/80 backdrop-blur-xl border border-white/30 w-full max-w-lg rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
            >

              {/* CLOSE */}
              <button
                onClick={() => setShowForm(false)}
                className="absolute right-4 top-4 text-gray-500 hover:text-red-500"
              >
                <X/>
              </button>

              {/* TITLE */}
              <div className="flex items-center gap-2 mb-6">

                <FileText className="text-purple-600"/>

                <h2 className="text-xl font-bold text-gray-800">
                  Upload Lab Report
                </h2>

              </div>

              {/* SEARCH */}
              <div className="flex gap-2 mb-3">

                <input
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleChange}
                  placeholder="Enter patient email"
                  className="flex-1 border border-gray-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />

                <button
                  onClick={searchPatient}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 rounded-lg flex items-center gap-1 shadow hover:shadow-lg"
                >
                  <Search size={16}/>
                  {searching ? "..." : "Search"}
                </button>

              </div>

              {patientFound === true &&
                <p className="text-green-600 text-sm mb-2">
                  ✔ Patient Found
                </p>
              }

              {patientFound === false &&
                <p className="text-red-600 text-sm mb-2">
                  ✘ New Patient
                </p>
              }

              {/* FORM */}
              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >

                <Input
                  icon={<User size={16}/>}
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  placeholder="Patient Name"
                />

                <Input
                  icon={<Mail size={16}/>}
                  name="patientEmail"
                  value={formData.patientEmail}
                  onChange={handleChange}
                  placeholder="Email"
                />

                <Input
                  icon={<Phone size={16}/>}
                  name="patientContact"
                  value={formData.patientContact}
                  onChange={handleChange}
                  placeholder="Contact"
                />

                {/* TEST SELECT */}
                <div>

                  <label className="font-medium text-gray-700">
                    Select Tests
                  </label>

                  <div className="border border-gray-200 rounded-lg p-3 max-h-40 overflow-y-auto bg-gray-50">

                    {commonTests.map(test => {

                      const checked =
                        formData.selectedTests.includes(test);

                      return (

                        <label
                          key={test}
                          className="flex gap-2 items-center py-1 hover:bg-purple-50 rounded px-2 cursor-pointer"
                        >

                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleTest(test)}
                          />

                          {test}

                        </label>

                      );

                    })}

                  </div>

                </div>

                {/* FILE */}
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-purple-300 rounded-xl p-4 cursor-pointer hover:bg-purple-50 transition">

                  <UploadCloud className="text-purple-600 mb-2"/>

                  <span className="text-sm text-gray-600">
                    Click to upload report
                  </span>

                  <input
                    type="file"
                    name="reportFile"
                    onChange={handleChange}
                    required
                    className="hidden"
                  />

                </label>

                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="Remarks"
                />

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition"
                  disabled={loading}
                >
                  {loading
                    ? "Uploading..."
                    : "Submit Report"}
                </motion.button>

              </form>

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>

    </div>

  );

}

function Input({ icon, ...props }) {

  return (

    <div className="relative">

      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        {icon}
      </div>

      <input
        {...props}
        className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
      />

    </div>

  );

}