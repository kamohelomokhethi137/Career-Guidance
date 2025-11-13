import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaChartLine, FaUsers, FaUniversity, FaBriefcase, FaDownload, FaFileAlt } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import AdminSidebar from "../../components/admin/Sidebar";
import AdminTopNav from "../../components/admin/TopNav";

const Reports = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalJobs: 0,
    totalInstitutes: 0,
    totalApplications: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load all data for reports
    const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const students = snapshot.docs.filter(doc => doc.data().role === "student");
      setStats(prev => ({ ...prev, totalStudents: students.length }));
    });

    const unsubscribeJobs = onSnapshot(collection(db, "jobs"), (snapshot) => {
      setStats(prev => ({ ...prev, totalJobs: snapshot.size }));
    });

    const unsubscribeInstitutes = onSnapshot(collection(db, "institutes"), (snapshot) => {
      setStats(prev => ({ ...prev, totalInstitutes: snapshot.size }));
    });

    const unsubscribeApplications = onSnapshot(collection(db, "applications"), (snapshot) => {
      setStats(prev => ({ ...prev, totalApplications: snapshot.size }));
    });

    // Set loading to false after initial load
    setTimeout(() => setLoading(false), 1000);

    return () => {
      unsubscribeUsers();
      unsubscribeJobs();
      unsubscribeInstitutes();
      unsubscribeApplications();
    };
  }, []);

  const reports = [
    { 
      title: "Total Students", 
      value: stats.totalStudents.toString(), 
      trend: "up", 
      icon: <FaUsers className="text-blue-400" />,
      bg: "bg-blue-900"
    },
    { 
      title: "Active Jobs", 
      value: stats.totalJobs.toString(), 
      trend: "up", 
      icon: <FaBriefcase className="text-green-400" />,
      bg: "bg-green-900"
    },
    { 
      title: "Institutions", 
      value: stats.totalInstitutes.toString(), 
      trend: "stable", 
      icon: <FaUniversity className="text-purple-400" />,
      bg: "bg-purple-900"
    },
    { 
      title: "Course Applications", 
      value: stats.totalApplications.toString(), 
      trend: "up", 
      icon: <FaFileAlt className="text-orange-400" />,
      bg: "bg-orange-900"
    },
  ];

  const exportReports = () => {
    toast.info("Exporting reports data...");
    // In a real app, this would generate CSV/PDF
    console.log("Exporting:", stats);
  };

  if (loading) {
    return (
      <div className="bg-black min-h-screen text-white flex">
        <AdminSidebar />
        <div className="flex-1 md:ml-64 flex items-center justify-center">
          <div className="text-center">Loading reports...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white flex">
      <AdminSidebar />
      <div className="flex-1 md:ml-64">
        <AdminTopNav />

        <main className="pt-20 px-4 md:px-8 lg:px-12 pb-8 space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-bold">System Reports</h1>
            <button 
              onClick={exportReports}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <FaDownload /> Export Data
            </button>
          </div>

          {/* Stats Grid */}
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
                  <div className={`p-3 rounded-lg ${r.bg}`}>
                    {r.icon}
                  </div>
                  <span className={`text-sm font-medium ${
                    r.trend === "up" ? "text-green-400" :
                    r.trend === "down" ? "text-red-400" : "text-gray-400"
                  }`}>
                    {r.trend === "up" ? "↑" : r.trend === "down" ? "↓" : "−"}
                  </span>
                </div>
                <h3 className="font-medium text-gray-300 mb-1">{r.title}</h3>
                <p className="text-2xl font-bold">{r.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Additional Stats */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaUsers className="text-blue-400" /> User Distribution
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Students</span>
                  <span className="font-semibold">{stats.totalStudents}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Institutions</span>
                  <span className="font-semibold">{stats.totalInstitutes}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Companies</span>
                  <span className="font-semibold">{stats.totalJobs > 0 ? "Active" : "None"}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaChartLine className="text-green-400" /> Application Stats
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Applications</span>
                  <span className="font-semibold">{stats.totalApplications}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Active Job Posts</span>
                  <span className="font-semibold">{stats.totalJobs}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Platform Usage</span>
                  <span className="font-semibold text-green-400">High</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Placeholder */}
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <h2 className="text-lg font-semibold mb-4">Monthly Overview</h2>
            <div className="h-64 bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">
              Analytics Chart - Integrate with Recharts/Chart.js
            </div>
          </div>
        </main>

        <ToastContainer position="bottom-right" theme="dark" />
      </div>
    </div>
  );
};

export default Reports;