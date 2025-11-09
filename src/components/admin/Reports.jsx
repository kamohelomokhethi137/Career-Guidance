import React from "react";
import { motion } from "framer-motion";
import { FaChartLine, FaUsers, FaUniversity , FaBriefcase, FaDownload } from "react-icons/fa";
import AdminSidebar from "../../components/admin/Sidebar";
import AdminTopNav from "../../components/admin/TopNav";

const Reports = () => {
  const reports = [
    { title: "Student Registration Growth", value: "+28%", trend: "up", icon: <FaUsers /> },
    { title: "Job Applications", value: "1,240", trend: "up", icon: <FaBriefcase /> },
    { title: "Active Institutions", value: "8", trend: "stable", icon: <FaUniversity /> },
    { title: "Revenue This Month", value: "M85,000", trend: "up", icon: <FaChartLine /> },
  ];

  return (
    <div className="bg-black min-h-screen text-white flex flex-col md:flex-row">
      <AdminSidebar />
      <div className="flex-1 md:ml-64">
        <AdminTopNav adminName="System Admin" />

        <main className="pt-20 px-4 md:px-8 lg:px-12 pb-8 space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-bold">System Reports</h1>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg">
              <FaDownload /> Export All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reports.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-gray-900 p-6 rounded-xl border border-gray-800"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-gray-800 rounded-lg">{r.icon}</div>
                  <span className={`text-sm font-medium ${
                    r.trend === "up" ? "text-green-400" :
                    r.trend === "down" ? "text-red-400" : "text-gray-400"
                  }`}>
                    {r.trend === "up" ? "↑" : r.trend === "down" ? "↓" : "−"} {r.value}
                  </span>
                </div>
                <h3 className="font-medium">{r.title}</h3>
              </motion.div>
            ))}
          </div>

          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <h2 className="text-lg font-semibold mb-4">Monthly Overview</h2>
            <div className="h-64 bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">
              [Chart Placeholder - Use Recharts or Chart.js]
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Reports;