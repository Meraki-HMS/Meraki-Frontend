"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Search } from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_LAB_API_BASE || "http://localhost:3000";

export default function PastLabReports() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const hmsUser = JSON.parse(localStorage.getItem("hmsUser"));

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const hmsUser = JSON.parse(localStorage.getItem("hmsUser"));

      const res = await axios.get(
        `${API_BASE}/lab-reports/hospital/${hmsUser.hospitalId}`,
      );

      setReports(res.data.labReports);
      setFilteredReports(res.data.labReports);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔎 Search by patient name
  useEffect(() => {
    const filtered = reports.filter((report) =>
      report.patientName.toLowerCase().includes(search.toLowerCase()),
    );

    setFilteredReports(filtered);
  }, [search, reports]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Past Lab Reports</h1>

        {/* Search */}
        <div className="relative w-64">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by patient name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white shadow-md rounded-2xl overflow-hidden border">
        {loading ? (
          <div className="p-6 text-center text-gray-500">
            Loading reports...
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No lab reports found.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4">Patient Name</th>
                <th className="p-4">Test</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-center">Report</th>
              </tr>
            </thead>

            <tbody>
              {filteredReports.map((report) => (
                <tr
                  key={report._id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-4 font-medium">{report.patientName}</td>
                  <td className="p-4">{report.testName}</td>
                  <td className="p-4">{report.patientContact}</td>
                  <td className="p-4">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-center">
                    <a
                      href={report.reportFile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:underline font-medium"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
