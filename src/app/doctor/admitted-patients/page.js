// "use client";

// import { useEffect, useState } from "react";
// import axios from "axios";
// import * as Tabs from "@radix-ui/react-tabs";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Search,
//   BedDouble,
//   X,
//   User,
//   Phone,
//   Mail,
//   Home,
//   Calendar,
//   Heart,
//   Stethoscope,
// } from "lucide-react";

// const API_BASE_URL = process.env.NEXT_PUBLIC_DOCTOR_API_BASE;

// export default function AdmittedPatientsPage() {
//   const [patients, setPatients] = useState([]);
//   const [filtered, setFiltered] = useState([]);
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [selected, setSelected] = useState(null);

//   const [plan, setPlan] = useState({
//     diagnosis: "",
//     medicines: [
//       {
//         name: "",
//         dosage: "",
//         frequency: "",
//         duration: "",
//         instructions: "",
//       },
//     ],
//     meals: [
//       {
//         meal_time: "Morning",
//         items: [],
//         instructions: "",
//       },
//     ],
//     procedures: [""],
//     notes: "",
//   });

//   const [hasPlan, setHasPlan] = useState(false);

//   const doctor =
//     typeof window !== "undefined"
//       ? JSON.parse(localStorage.getItem("hmsUser"))
//       : null;

//   const doctorId = doctor?.doctorid;
//   const hospitalId = doctor?.hospitalId;

//   /* ---------------- LOAD ADMITTED PATIENTS ---------------- */
//   useEffect(() => {
//     if (!doctorId || !hospitalId) return;

//     axios
//       .get(`${API_BASE_URL}/api/admissions/doctor-patients`, {
//         params: { hospitalId, doctorId },
//       })
//       .then((res) => {
//         setPatients(res.data);
//         setFiltered(res.data);
//       })
//       .finally(() => setLoading(false));
//   }, [doctorId, hospitalId]);

//   const handleSearch = (v) => {
//     setSearch(v);
//     setFiltered(
//       patients.filter((p) => p.fullName.toLowerCase().includes(v.toLowerCase()))
//     );
//   };

//   /* ---------------- LOAD TREATMENT PLAN ---------------- */
//   useEffect(() => {
//     if (!selected) return;

//     axios
//       .get(`${API_BASE_URL}/treatment-plans/patient/${selected.patientId}`)
//       .then((res) => {
//         if (res.data?.data?._id) {
//           const data = res.data.data;

//           setPlan({
//             ...data,
//             medicines:
//               data.medicines && data.medicines.length > 0
//                 ? data.medicines
//                 : [
//                     {
//                       name: "",
//                       dosage: "",
//                       frequency: "",
//                       duration: "",
//                       instructions: "",
//                     },
//                   ],

//             meals:
//               data.meals && data.meals.length > 0
//                 ? data.meals
//                 : [
//                     {
//                       meal_time: "Morning",
//                       items: [],
//                       instructions: "",
//                     },
//                   ],

//             procedures:
//               data.procedures && data.procedures.length > 0
//                 ? data.procedures
//                 : [""],
//           });

//           setHasPlan(true);
//         } else {
//           setHasPlan(false);
//           resetPlan();
//         }
//       })

//       .catch(() => {
//         setHasPlan(false);
//         resetPlan();
//       });
//   }, [selected]);

//   /* ---------------- RESET ON MODAL CLOSE ---------------- */
//   useEffect(() => {
//     if (!selected) {
//       resetPlan();
//       setHasPlan(false);
//     }
//   }, [selected]);

//   const resetPlan = () => {
//     setPlan({
//       diagnosis: "",
//       medicines: [
//         {
//           name: "",
//           dosage: "",
//           frequency: "",
//           duration: "",
//           instructions: "",
//         },
//       ],
//       meals: [
//         {
//           meal_time: "Morning",
//           items: [],
//           instructions: "",
//         },
//       ],
//       procedures: [""],
//       notes: "",
//     });
//   };

//   /* ---------------- SAVE / UPDATE PLAN ---------------- */
//   const saveTreatmentPlan = async () => {
//     if (
//       !plan.medicines[0].name ||
//       !plan.medicines[0].dosage ||
//       !plan.medicines[0].frequency ||
//       !plan.medicines[0].duration
//     ) {
//       alert(
//         "Please fill at least one complete medicine (name, dosage, frequency, duration)"
//       );
//       return;
//     }

//     const payload = {
//       patient_id: selected.patientId,
//       doctor_id: doctorId,
//       bed_assignment_id: selected._id,
//       diagnosis: plan.diagnosis,
//       medicines: plan.medicines,
//       meals: plan.meals,
//       procedures: plan.procedures,
//       notes: plan.notes,
//     };

//     try {
//       if (hasPlan) {
//         await axios.put(`${API_BASE_URL}/treatment-plans/${plan._id}`, payload);
//       } else {
//         await axios.post(`${API_BASE_URL}/treatment-plans`, payload);
//         setHasPlan(true);
//       }

//       alert("Treatment Plan Saved Successfully");
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to save treatment plan");
//     }
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
//         <BedDouble /> Admitted Patients
//       </h1>

//       <input
//         value={search}
//         onChange={(e) => handleSearch(e.target.value)}
//         placeholder="Search patient..."
//         className="w-full mb-6 p-3 border rounded-xl"
//       />

//       {loading && <p>Loading...</p>}

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {filtered.map((p) => (
//           <div
//             key={p._id}
//             onClick={() => setSelected(p)}
//             className="bg-white p-5 rounded-xl shadow hover:shadow-lg cursor-pointer"
//           >
//             <h2 className="font-semibold text-lg">{p.fullName}</h2>
//             <p className="text-sm text-gray-600">{p.department}</p>
//             <p className="text-sm">Bed: {p.bedNumber}</p>
//           </div>
//         ))}
//       </div>

//       {/* ---------------- MODAL ---------------- */}
//       <AnimatePresence>
//         {selected && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
//           >
//             <motion.div
//               initial={{ scale: 0.95 }}
//               animate={{ scale: 1 }}
//               exit={{ scale: 0.95 }}
//               className="bg-white w-full max-w-5xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
//             >
//               <div className="flex justify-between items-center mb-6">
//                 <h2 className="text-2xl font-bold">{selected.fullName}</h2>
//                 <X
//                   onClick={() => setSelected(null)}
//                   className="cursor-pointer"
//                 />
//               </div>

//               <Tabs.Root defaultValue="details">
//                 <Tabs.List className="flex gap-6 border-b mb-6">
//                   <Tabs.Trigger value="details">Patient Details</Tabs.Trigger>
//                   <Tabs.Trigger value="treatment">Treatment Plan</Tabs.Trigger>
//                 </Tabs.List>

//                 <Tabs.Content value="details">
//                   <div className="grid grid-cols-2 gap-4 text-sm">
//                     <Info
//                       icon={<User />}
//                       label="Name"
//                       value={selected.fullName}
//                     />
//                     <Info
//                       icon={<Heart />}
//                       label="Gender"
//                       value={selected.gender}
//                     />
//                     <Info
//                       icon={<Mail />}
//                       label="Email"
//                       value={selected.email}
//                     />
//                     <Info
//                       icon={<Phone />}
//                       label="Phone"
//                       value={selected.contactNumber}
//                     />
//                     <Info
//                       icon={<Home />}
//                       label="Address"
//                       value={selected.currentAddress}
//                     />
//                     <Info
//                       icon={<Calendar />}
//                       label="DOB"
//                       value={new Date(selected.dob).toDateString()}
//                     />
//                     <Info
//                       icon={<BedDouble />}
//                       label="Bed"
//                       value={selected.bedNumber}
//                     />
//                     <Info
//                       icon={<Stethoscope />}
//                       label="Department"
//                       value={selected.department}
//                     />
//                     <Info label="Ward Type" value={selected.wardType} />
//                     <Info label="Room Type" value={selected.roomType} />
//                     <Info
//                       label="Admission No"
//                       value={selected.admissionNumber}
//                     />
//                     <Info
//                       label="Admission Date"
//                       value={new Date(
//                         selected.admissionDateTime
//                       ).toLocaleString()}
//                     />
//                   </div>
//                 </Tabs.Content>

//                 <Tabs.Content value="treatment">
//                   <div className="space-y-4">
//                     <Input
//                       label="Diagnosis"
//                       value={plan.diagnosis}
//                       onChange={(v) => setPlan({ ...plan, diagnosis: v })}
//                     />
//                     <h3 className="font-semibold">Medicines</h3>

//                     <Input
//                       label="Name"
//                       value={plan.medicines[0].name}
//                       onChange={(v) =>
//                         setPlan({
//                           ...plan,
//                           medicines: [{ ...plan.medicines[0], name: v }],
//                         })
//                       }
//                     />

//                     <Input
//                       label="Dosage"
//                       value={plan.medicines[0].dosage}
//                       onChange={(v) =>
//                         setPlan({
//                           ...plan,
//                           medicines: [{ ...plan.medicines[0], dosage: v }],
//                         })
//                       }
//                     />

//                     <Input
//                       label="Frequency"
//                       value={plan.medicines[0].frequency}
//                       onChange={(v) =>
//                         setPlan({
//                           ...plan,
//                           medicines: [{ ...plan.medicines[0], frequency: v }],
//                         })
//                       }
//                     />

//                     <Input
//                       label="Duration"
//                       value={plan.medicines[0].duration}
//                       onChange={(v) =>
//                         setPlan({
//                           ...plan,
//                           medicines: [{ ...plan.medicines[0], duration: v }],
//                         })
//                       }
//                     />

//                     <Input
//                       label="Instructions"
//                       value={plan.medicines[0].instructions}
//                       onChange={(v) =>
//                         setPlan({
//                           ...plan,
//                           medicines: [
//                             { ...plan.medicines[0], instructions: v },
//                           ],
//                         })
//                       }
//                     />

//                     <h3 className="font-semibold">Meals</h3>

//                     <select
//                       value={plan.meals[0].meal_time}
//                       onChange={(e) =>
//                         setPlan({
//                           ...plan,
//                           meals: [
//                             { ...plan.meals[0], meal_time: e.target.value },
//                           ],
//                         })
//                       }
//                       className="w-full p-2 border rounded"
//                     >
//                       <option>Morning</option>
//                       <option>Afternoon</option>
//                       <option>Evening</option>
//                       <option>Night</option>
//                     </select>

//                     <Input
//                       label="Meal Items (comma separated)"
//                       value={plan.meals[0].items.join(",")}
//                       onChange={(v) =>
//                         setPlan({
//                           ...plan,
//                           meals: [
//                             {
//                               ...plan.meals[0],
//                               items: v.split(",").map((i) => i.trim()),
//                             },
//                           ],
//                         })
//                       }
//                     />

//                     <Input
//                       label="Meal Instructions"
//                       value={plan.meals[0].instructions}
//                       onChange={(v) =>
//                         setPlan({
//                           ...plan,
//                           meals: [{ ...plan.meals[0], instructions: v }],
//                         })
//                       }
//                     />

//                     <Input
//                       label="Procedures (comma separated)"
//                       value={plan.procedures.join(",")}
//                       onChange={(v) =>
//                         setPlan({
//                           ...plan,
//                           procedures: v.split(",").map((p) => p.trim()),
//                         })
//                       }
//                     />

//                     <Textarea
//                       label="Notes"
//                       value={plan.notes}
//                       onChange={(v) => setPlan({ ...plan, notes: v })}
//                     />

//                     <button
//                       onClick={saveTreatmentPlan}
//                       className="w-full bg-blue-600 text-white py-3 rounded-xl"
//                     >
//                       {hasPlan ? "Update Treatment Plan" : "Add Treatment Plan"}
//                     </button>
//                   </div>
//                 </Tabs.Content>
//               </Tabs.Root>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// /* ---------- UI Helpers ---------- */
// function Info({ icon, label, value }) {
//   return (
//     <div className="bg-gray-50 p-3 rounded-xl">
//       <p className="text-xs text-gray-500 flex items-center gap-1">
//         {icon} {label}
//       </p>
//       <p className="font-medium">{value || "—"}</p>
//     </div>
//   );
// }

// function Input({ label, value, onChange }) {
//   return (
//     <div>
//       <label className="text-sm font-medium">{label}</label>
//       <input
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         className="w-full p-3 border rounded-xl"
//       />
//     </div>
//   );
// }

// function Textarea({ label, value, onChange }) {
//   return (
//     <div>
//       <label className="text-sm font-medium">{label}</label>
//       <textarea
//         rows={3}
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         className="w-full p-3 border rounded-xl"
//       />
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import * as Tabs from "@radix-ui/react-tabs";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  BedDouble,
  X,
  User,
  Phone,
  Mail,
  Home,
  Calendar,
  Heart,
  Stethoscope,
  ClipboardList,
  Pill,
  Utensils,
  FileText,
  Save,
} from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_DOCTOR_API_BASE;

export default function AdmittedPatientsPage() {
  const [patients, setPatients] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [hasPlan, setHasPlan] = useState(false);

  const [plan, setPlan] = useState({
    diagnosis: "",
    medicines: [{ name: "", dosage: "", frequency: "", duration: "", instructions: "" }],
    meals: [{ meal_time: "Morning", items: [], instructions: "" }],
    procedures: [""],
    notes: "",
  });

  const doctor =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("hmsUser"))
      : null;

  const doctorId = doctor?.doctorid;
  const hospitalId = doctor?.hospitalId;

  /* ---------------- LOAD PATIENTS ---------------- */
  useEffect(() => {
    if (!doctorId || !hospitalId) return;

    axios
      .get(`${API_BASE_URL}/api/admissions/doctor-patients`, {
        params: { hospitalId, doctorId },
      })
      .then((res) => {
        setPatients(res.data);
        setFiltered(res.data);
      })
      .finally(() => setLoading(false));
  }, [doctorId, hospitalId]);

  const handleSearch = (v) => {
    setSearch(v);
    setFiltered(
      patients.filter((p) =>
        p.fullName.toLowerCase().includes(v.toLowerCase())
      )
    );
  };

  /* ---------------- LOAD PLAN ---------------- */
  useEffect(() => {
    if (!selected) return;

    axios
      .get(`${API_BASE_URL}/treatment-plans/patient/${selected.patientId}`)
      .then((res) => {
        if (res.data?.data?._id) {
          setPlan(res.data.data);
          setHasPlan(true);
        } else {
          setHasPlan(false);
        }
      })
      .catch(() => setHasPlan(false));
  }, [selected]);

  /* ---------------- SAVE PLAN ---------------- */
  const saveTreatmentPlan = async () => {
    const payload = {
      patient_id: selected.patientId,
      doctor_id: doctorId,
      bed_assignment_id: selected._id,
      ...plan,
    };

    try {
      if (hasPlan) {
        await axios.put(`${API_BASE_URL}/treatment-plans/${plan._id}`, payload);
      } else {
        await axios.post(`${API_BASE_URL}/treatment-plans`, payload);
        setHasPlan(true);
      }
      alert("Treatment Plan Saved");
    } catch (err) {
      alert("Failed to save treatment plan");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <BedDouble className="text-blue-600" />
          Admitted Patients
        </h1>

        <div className="relative w-96">
          <Search className="absolute left-3 top-3 text-gray-400" />
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search patient name..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl border bg-white shadow"
          />
        </div>
      </div>

      {/* GRID */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((p) => (
            <div
              key={p._id}
              onClick={() => setSelected(p)}
              className="cursor-pointer rounded-2xl bg-white shadow-lg p-5 hover:ring-2 hover:ring-blue-500 transition"
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-semibold text-lg">{p.fullName}</h2>
                <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                  Bed {p.bedNumber}
                </span>
              </div>
              <p className="text-sm text-gray-500">{p.department}</p>
              <p className="text-sm mt-1">Ward: {p.wardType}</p>
            </div>
          ))}
        </div>
      )}

      {/* ---------------- MODAL ---------------- */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur flex justify-center items-center"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl 
                         max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* HEADER */}
              <div className="flex justify-between items-center px-8 py-6 border-b bg-slate-50 shrink-0">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <User />
                  {selected.fullName}
                </h2>
                <X onClick={() => setSelected(null)} className="cursor-pointer" />
              </div>

              {/* TABS */}
              <Tabs.Root defaultValue="details" className="flex flex-col flex-1 overflow-hidden">
                <Tabs.List className="flex gap-8 px-8 py-4 border-b text-sm font-medium shrink-0">
                  <Tabs.Trigger value="details">Patient Details</Tabs.Trigger>
                  <Tabs.Trigger value="treatment">Treatment Plan</Tabs.Trigger>
                </Tabs.List>

                {/* DETAILS TAB (SCROLLABLE) */}
                <Tabs.Content
                  value="details"
                  className="flex-1 overflow-y-auto p-8 grid grid-cols-2 md:grid-cols-3 gap-6"
                >
                  <Info icon={<User />} label="Name" value={selected.fullName} />
                  <Info icon={<Heart />} label="Gender" value={selected.gender} />
                  <Info icon={<Mail />} label="Email" value={selected.email} />
                  <Info icon={<Phone />} label="Phone" value={selected.contactNumber} />
                  <Info icon={<Home />} label="Address" value={selected.currentAddress} />
                  <Info icon={<Calendar />} label="DOB" value={new Date(selected.dob).toDateString()} />
                  <Info icon={<BedDouble />} label="Bed" value={selected.bedNumber} />
                  <Info icon={<Stethoscope />} label="Department" value={selected.department} />
                </Tabs.Content>

                {/* TREATMENT TAB (SCROLLABLE) */}
                <Tabs.Content
                  value="treatment"
                  className="flex-1 overflow-y-auto p-8 space-y-6"
                >
                  <Section icon={<ClipboardList />} title="Diagnosis">
                    <Input
                      value={plan.diagnosis}
                      onChange={(v) => setPlan({ ...plan, diagnosis: v })}
                    />
                  </Section>

                  <Section icon={<Pill />} title="Medicines">
                    <Grid>
                      <Input label="Name" value={plan.medicines[0].name}
                        onChange={(v) =>
                          setPlan({ ...plan, medicines: [{ ...plan.medicines[0], name: v }] })
                        }
                      />
                      <Input label="Dosage" value={plan.medicines[0].dosage}
                        onChange={(v) =>
                          setPlan({ ...plan, medicines: [{ ...plan.medicines[0], dosage: v }] })
                        }
                      />
                      <Input label="Frequency" value={plan.medicines[0].frequency}
                        onChange={(v) =>
                          setPlan({ ...plan, medicines: [{ ...plan.medicines[0], frequency: v }] })
                        }
                      />
                      <Input label="Duration" value={plan.medicines[0].duration}
                        onChange={(v) =>
                          setPlan({ ...plan, medicines: [{ ...plan.medicines[0], duration: v }] })
                        }
                      />
                    </Grid>
                  </Section>

                  <Section icon={<Utensils />} title="Meals">
                    <Input
                      label="Items (comma separated)"
                      value={plan.meals[0].items.join(",")}
                      onChange={(v) =>
                        setPlan({
                          ...plan,
                          meals: [{ ...plan.meals[0], items: v.split(",").map(i => i.trim()) }],
                        })
                      }
                    />
                  </Section>

                  <Section icon={<FileText />} title="Notes">
                    <textarea
                      rows={3}
                      className="w-full p-4 rounded-xl border"
                      value={plan.notes}
                      onChange={(e) => setPlan({ ...plan, notes: e.target.value })}
                    />
                  </Section>

                  <button
                    onClick={saveTreatmentPlan}
                    className="w-full flex items-center justify-center gap-2 
                               bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl text-lg"
                  >
                    <Save />
                    {hasPlan ? "Update Treatment Plan" : "Save Treatment Plan"}
                  </button>
                </Tabs.Content>
              </Tabs.Root>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- UI COMPONENTS ---------- */

const Info = ({ icon, label, value }) => (
  <div className="p-4 rounded-2xl bg-slate-50 border">
    <p className="text-xs text-gray-500 flex items-center gap-2">
      {icon} {label}
    </p>
    <p className="font-semibold">{value || "—"}</p>
  </div>
);

const Input = ({ label, value, onChange }) => (
  <div>
    {label && <label className="text-sm font-medium">{label}</label>}
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full mt-1 p-3 border rounded-xl"
    />
  </div>
);

const Section = ({ icon, title, children }) => (
  <div className="bg-slate-50 p-6 rounded-3xl space-y-4 border">
    <h3 className="font-semibold flex items-center gap-2 text-lg">
      {icon} {title}
    </h3>
    {children}
  </div>
);

const Grid = ({ children }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {children}
  </div>
);
