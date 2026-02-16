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
    medicines: [
      { name: "", dosage: "", frequency: "", duration: "", instructions: "" },
    ],
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
      .get(`${API_BASE_URL}/api/admissions/allAdmitted-patients`, {
        params: { hospitalId, doctorId },
      })
      .then((res) => {
        setPatients(res.data.patients || []);
        setFiltered(res.data.patients || []);
      })

      .finally(() => setLoading(false));
  }, [doctorId, hospitalId]);

  const handleSearch = (v) => {
    setSearch(v);
    setFiltered(
      patients.filter((p) =>
        p.fullName.toLowerCase().includes(v.toLowerCase()),
      ),
    );
  };

  /* ---------------- LOAD PLAN ---------------- */
  useEffect(() => {
  if (!selected?._id) return;

  axios
    .get(
      `${API_BASE_URL}/treatment-plans/admission/${selected._id}`
    )
    .then((res) => {
      if (res.data?.success && res.data?.data) {
        setPlan(res.data.data);
        setHasPlan(true);
      } else {
        setHasPlan(false);
        resetPlan();
      }
    })
    .catch(() => {
      setHasPlan(false);
      resetPlan();
    });
}, [selected]);

const resetPlan = () => {
  setPlan({
    diagnosis: "",
    medicines: [
      { name: "", dosage: "", frequency: "", duration: "", instructions: "" },
    ],
    meals: [{ meal_time: "Morning", items: [], instructions: "" }],
    procedures: [""],
    notes: "",
  });
};


  /* ---------------- SAVE PLAN ---------------- */
  const saveTreatmentPlan = async () => {
    const payload = {
      patient_id: selected.patientId,
      doctor_id: doctorId,
      admission_id: selected._id,
      diagnosis: plan.diagnosis,
      medicines: plan.medicines,
      meals: plan.meals,
      procedures: plan.procedures,
      notes: plan.notes,
    };

    try {
      if (hasPlan && plan._id) {
        await axios.put(`${API_BASE_URL}/treatment-plans/${plan._id}`, payload);
      } else {
        const res = await axios.post(
          `${API_BASE_URL}/treatment-plans`,
          payload,
        );
        setPlan(res.data.data); // store full object including _id
        setHasPlan(true);
      }

      alert("Treatment Plan Saved");
    } catch (err) {
      console.log(err.response?.data);
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
              className="w-full max-w-5xl bg-white rounded-2xl shadow-xl 
           max-h-[85vh] flex flex-col overflow-hidden"
            >
              {/* HEADER */}
              <div className="flex justify-between items-center px-8 py-6 border-b bg-slate-50 shrink-0">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <User />
                  {selected.fullName}
                </h2>
                <X
                  onClick={() => setSelected(null)}
                  className="cursor-pointer"
                />
              </div>

              {/* TABS */}
              <Tabs.Root
                defaultValue="details"
                className="flex flex-col flex-1 overflow-hidden"
              >
                <Tabs.List className="flex gap-6 px-6 py-3 border-b text-sm font-medium bg-white sticky top-0 z-10">
                  <Tabs.Trigger value="details">Patient Details</Tabs.Trigger>
                  <Tabs.Trigger value="treatment">Treatment Plan</Tabs.Trigger>
                </Tabs.List>

                {/* DETAILS TAB (SCROLLABLE) */}
                <Tabs.Content
                  value="details"
                  className="flex-1 overflow-y-auto p-8 grid grid-cols-2 md:grid-cols-3 gap-6"
                >
                  <Info
                    icon={<User />}
                    label="Name"
                    value={selected.fullName}
                  />
                  <Info
                    icon={<Heart />}
                    label="Gender"
                    value={selected.gender}
                  />
                  <Info icon={<Mail />} label="Email" value={selected.email} />
                  <Info
                    icon={<Phone />}
                    label="Phone"
                    value={selected.contactNumber}
                  />
                  <Info
                    icon={<Home />}
                    label="Address"
                    value={selected.currentAddress}
                  />
                  <Info
                    icon={<Calendar />}
                    label="DOB"
                    value={new Date(selected.dob).toDateString()}
                  />
                  <Info
                    icon={<BedDouble />}
                    label="Bed"
                    value={selected.bedNumber}
                  />
                  <Info
                    icon={<Stethoscope />}
                    label="Department"
                    value={selected.department}
                  />
                </Tabs.Content>

                {/* TREATMENT TAB (SCROLLABLE) */}
                <Tabs.Content
                  value="treatment"
                  className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50"
                >
                  <Section icon={<ClipboardList />} title="Diagnosis">
                    <Input
                      value={plan.diagnosis}
                      onChange={(v) => setPlan({ ...plan, diagnosis: v })}
                    />
                  </Section>

                  <Section icon={<Pill />} title="Medicines">
                    <div className="space-y-4">
                      {plan.medicines.map((med, index) => (
                        <div
                          key={index}
                          className="bg-white border rounded-2xl p-4 shadow-sm space-y-3"
                        >
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            <input
                              placeholder="Name"
                              value={med.name}
                              onChange={(e) => {
                                const updated = [...plan.medicines];
                                updated[index].name = e.target.value;
                                setPlan({ ...plan, medicines: updated });
                              }}
                              className="p-2 border rounded-lg"
                            />

                            <input
                              placeholder="Dosage"
                              value={med.dosage}
                              onChange={(e) => {
                                const updated = [...plan.medicines];
                                updated[index].dosage = e.target.value;
                                setPlan({ ...plan, medicines: updated });
                              }}
                              className="p-2 border rounded-lg"
                            />

                            <input
                              placeholder="Frequency"
                              value={med.frequency}
                              onChange={(e) => {
                                const updated = [...plan.medicines];
                                updated[index].frequency = e.target.value;
                                setPlan({ ...plan, medicines: updated });
                              }}
                              className="p-2 border rounded-lg"
                            />

                            <input
                              placeholder="Duration"
                              value={med.duration}
                              onChange={(e) => {
                                const updated = [...plan.medicines];
                                updated[index].duration = e.target.value;
                                setPlan({ ...plan, medicines: updated });
                              }}
                              className="p-2 border rounded-lg"
                            />

                            <button
                              type="button"
                              onClick={() => {
                                const updated = plan.medicines.filter(
                                  (_, i) => i !== index,
                                );
                                setPlan({ ...plan, medicines: updated });
                              }}
                              className="bg-red-50 text-red-500 rounded-lg px-2"
                            >
                              <X size={18} />
                            </button>
                          </div>

                          <input
                            placeholder="Instructions"
                            value={med.instructions}
                            onChange={(e) => {
                              const updated = [...plan.medicines];
                              updated[index].instructions = e.target.value;
                              setPlan({ ...plan, medicines: updated });
                            }}
                            className="w-full p-2 border rounded-lg"
                          />
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() =>
                          setPlan({
                            ...plan,
                            medicines: [
                              ...plan.medicines,
                              {
                                name: "",
                                dosage: "",
                                frequency: "",
                                duration: "",
                                instructions: "",
                              },
                            ],
                          })
                        }
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100"
                      >
                        + Add Medicine
                      </button>
                    </div>
                  </Section>

                  <Section icon={<Utensils />} title="Meals">
                    <Input
                      label="Items (comma separated)"
                      value={plan.meals[0].items.join(",")}
                      onChange={(v) =>
                        setPlan({
                          ...plan,
                          meals: [
                            {
                              ...plan.meals[0],
                              items: v.split(",").map((i) => i.trim()),
                            },
                          ],
                        })
                      }
                    />
                  </Section>

                  <Section icon={<Stethoscope />} title="Procedures">
                    <div className="space-y-3">
                      {plan.procedures.map((proc, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 bg-white p-3 rounded-xl border shadow-sm"
                        >
                          <input
                            value={proc}
                            placeholder="Enter procedure (e.g. ECG, Surgery)"
                            onChange={(e) => {
                              const updated = [...plan.procedures];
                              updated[index] = e.target.value;
                              setPlan({ ...plan, procedures: updated });
                            }}
                            className="flex-1 p-2 outline-none"
                          />

                          <button
                            type="button"
                            onClick={() => {
                              const updated = plan.procedures.filter(
                                (_, i) => i !== index,
                              );
                              setPlan({ ...plan, procedures: updated });
                            }}
                            className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() =>
                          setPlan({
                            ...plan,
                            procedures: [...plan.procedures, ""],
                          })
                        }
                        className="flex items-center gap-2 px-4 py-2 rounded-xl 
                 bg-blue-50 text-blue-600 hover:bg-blue-100 
                 font-medium transition"
                      >
                        + Add Procedure
                      </button>
                    </div>
                  </Section>

                  <Section icon={<FileText />} title="Notes">
                    <textarea
                      rows={3}
                      className="w-full p-4 rounded-xl border"
                      value={plan.notes}
                      onChange={(e) =>
                        setPlan({ ...plan, notes: e.target.value })
                      }
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
      className="w-full mt-1 p-2 border rounded-lg text-sm"
    />
  </div>
);

const Section = ({ icon, title, children }) => (
  <div className="bg-slate-50 p-4 rounded-2xl space-y-3 border">
    <h3 className="font-semibold flex items-center gap-2 text-lg">
      {icon} {title}
    </h3>
    {children}
  </div>
);

const Grid = ({ children }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
);
