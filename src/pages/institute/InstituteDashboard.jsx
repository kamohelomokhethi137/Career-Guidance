// src/pages/institute/Dashboard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaUsers,
  FaFileAlt,
  FaCheckCircle,
  FaClock,
  FaCalendar,
  FaBuilding,
  FaBell,
  FaBookOpen,
  FaTimesCircle,
  FaPaperPlane,
} from "react-icons/fa";
import InstituteSidebar from "../../components/institute/Sidebar";
import InstituteTopNav from "../../components/institute/TopNav";
import { ToastContainer } from "react-toastify";

// Mock data
const stats = [
  { label: "Applications", value: 48, icon: FaFileAlt, color: "text-blue-400", bg: "bg-blue-900", link: "/institute/applications" },
  { label: "Admitted", value: 32, icon: FaCheckCircle, color: "text-green-400", bg: "bg-green-900", link: "/institute/admissions" },
  { label: "Pending Review", value: 16, icon: FaClock, color: "text-yellow-400", bg: "bg-yellow-900", link: "/institute/applications" },
];

const recentActivity = [
  { id: 1, message: "Admitted Kamohelo Mokhethi to BSc CS", time: "1h ago", icon: FaCheckCircle, color: "text-green-400" },
  { id: 2, message: "Rejected 2 incomplete applications", time: "3h ago", icon: FaTimesCircle, color: "text-red-400" },
  { id: 3, message: "Published February intake results", time: "1d ago", icon: FaPaperPlane, color: "text-blue-400" },
];

const upcomingDeadlines = [
  { id: 1, title: "February Intake Deadline", date: "2024-02-15", daysLeft: 2 },
  { id: 2, title: "August Intake Opens", date: "2024-08-01", daysLeft: 95 },
];

const StatCard = ({ stat }) => {
  const Icon = stat.icon;
  return (
    <Link to={stat.link}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="bg-gray-900 rounded-xl p-6 border border-gray-800 cursor-pointer transition-all hover:border-gray-700"
      >
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${stat.bg}`}>
            <Icon className={`text-xl ${stat.color}`} />
          </div>
          <span className="text-3xl font-bold">{stat.value}</span>
        </div>
        <p className="text-gray-400 text-sm">{stat.label}</p>
      </motion.div>
    </Link>
  );
};

const ActivityItem = ({ item }) => {
  const Icon = item.icon;
  return (
    <div className="flex items-start space-x-3 p-3 rounded-lg bg-gray-900 border border-gray-800">
      <div className={`p-2 rounded-lg ${item.color.replace("text-", "bg-").replace("400", "900")}`}>
        <Icon className={`text-sm ${item.color}`} />
      </div>
      <div className="flex-1">
        <p className="text-sm text-white">{item.message}</p>
        <p className="text-xs text-gray-500">{item.time}</p>
      </div>
    </div>
  );
};

const DeadlineItem = ({ deadline }) => (
  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-900 border border-gray-800">
    <div>
      <p className="text-sm font-medium text-white">{deadline.title}</p>
      <p className="text-xs text-gray-400">Due: {new Date(deadline.date).toLocaleDateString()}</p>
    </div>
    <div className="text-right">
      <p className={`text-sm font-bold ${deadline.daysLeft <= 3 ? "text-red-400" : "text-yellow-400"}`}>
        {deadline.daysLeft} days left
      </p>
    </div>
  </div>
);

const InstituteDashboard = () => {
  return (
    <div className="bg-black min-h-screen text-white flex flex-col md:flex-row">
      <InstituteSidebar />

      <div className="flex-1 md:ml-64">
        <InstituteTopNav instituteName="Limkokwing University" />

        <main className="pt-20 px-4 md:px-8 lg:px-12 space-y-8 pb-8">
          {/* Welcome */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome, Limkokwing!</h1>
            <p className="text-white/70 text-sm md:text-base">
              Manage applications, publish results, and track your institution's progress.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <StatCard stat={stat} />
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FaClock className="text-gray-400" /> Recent Activity
              </h2>
              <div className="space-y-2">
                {recentActivity.map((item) => (
                  <ActivityItem key={item.id} item={item} />
                ))}
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FaCalendar className="text-gray-400" /> Upcoming Deadlines
              </h2>
              <div className="space-y-2">
                {upcomingDeadlines.map((d) => (
                  <DeadlineItem key={d.id} deadline={d} />
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link to="/institute/applications" className="block">
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-4 rounded-xl text-center hover:scale-105 transition-transform">
                  <FaFileAlt className="mx-auto text-2xl mb-2" />
                  <p className="text-sm font-medium">Applications</p>
                </div>
              </Link>
              <Link to="/institute/admissions" className="block">
                <div className="bg-gradient-to-br from-green-600 to-green-800 p-4 rounded-xl text-center hover:scale-105 transition-transform">
                  <FaPaperPlane className="mx-auto text-2xl mb-2" />
                  <p className="text-sm font-medium">Publish Results</p>
                </div>
              </Link>
              <Link to="/institute/courses" className="block">
                <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-4 rounded-xl text-center hover:scale-105 transition-transform">
                  <FaBookOpen className="mx-auto text-2xl mb-2" />
                  <p className="text-sm font-medium">Manage Courses</p>
                </div>
              </Link>
              <Link to="/institute/faculties" className="block">
                <div className="bg-gradient-to-br from-yellow-600 to-yellow-800 p-4 rounded-xl text-center hover:scale-105 transition-transform">
                  <FaBuilding className="mx-auto text-2xl mb-2" />
                  <p className="text-sm font-medium">Faculties</p>
                </div>
              </Link>
            </div>
          </div>
        </main>

        <ToastContainer position="bottom-right" theme="dark" />
      </div>
    </div>
  );
};

export default InstituteDashboard;