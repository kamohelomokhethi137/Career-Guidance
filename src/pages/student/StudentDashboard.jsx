import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaFileAlt,
  FaBriefcase,
  FaBell,
  FaUpload,
  FaCalendar,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";
import StudentSidebar from "../../components/student/Sidebar";
import StudentTopNav from "../../components/student/TopNav";
import { ToastContainer } from "react-toastify";

// 🔹 Mock data (replace with backend fetch later)
const stats = [
  { label: "Applications", value: 3, icon: FaFileAlt, color: "text-blue-400", bg: "bg-blue-900", link: "/student/courses" },
  { label: "Job Matches", value: 12, icon: FaBriefcase, color: "text-green-400", bg: "bg-green-900", link: "/student/jobs" },
  { label: "Notifications", value: 5, icon: FaBell, color: "text-yellow-400", bg: "bg-yellow-900", link: "/student/notifications" },
];

const recentActivity = [
  { id: 1, type: "application", message: "Applied to Junior Developer at Tech Solutions", time: "2h ago", icon: FaCheckCircle, color: "text-green-400" },
  { id: 2, type: "upload", message: "Uploaded Academic Transcript", time: "5h ago", icon: FaUpload, color: "text-blue-400" },
  { id: 3, type: "job", message: "New job match: IT Support at Bank of Lesotho", time: "1d ago", icon: FaBriefcase, color: "text-green-400" },
];

const upcomingDeadlines = [
  { id: 1, title: "Diploma in IT - Lesotho College", date: "2024-02-20", daysLeft: 3 },
  { id: 2, title: "BSc Computer Science - Limkokwing", date: "2024-02-25", daysLeft: 8 },
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

const StudentDashboard = () => {
  // 🔹 Read user from localStorage directly
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const studentName = user.name || "User";

  return (
    <div className="bg-black min-h-screen text-white flex flex-col md:flex-row">
      <StudentSidebar />

      <div className="flex-1 md:ml-64">
        <StudentTopNav studentName={studentName} />

        <main className="pt-20 px-4 md:px-8 lg:px-12 space-y-8 pb-8">
          {/* Welcome */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, {studentName}!</h1>
            <p className="text-white/70 text-sm md:text-base">
              Here's what's happening with your applications and career journey.
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
              <Link to="/student/jobs" className="block">
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-4 rounded-xl text-center hover:scale-105 transition-transform">
                  <FaBriefcase className="mx-auto text-2xl mb-2" />
                  <p className="text-sm font-medium">Find Jobs</p>
                </div>
              </Link>
              <Link to="/student/applications" className="block">
                <div className="bg-gradient-to-br from-green-600 to-green-800 p-4 rounded-xl text-center hover:scale-105 transition-transform">
                  <FaFileAlt className="mx-auto text-2xl mb-2" />
                  <p className="text-sm font-medium">Applications</p>
                </div>
              </Link>
              <Link to="/student/documents" className="block">
                <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-4 rounded-xl text-center hover:scale-105 transition-transform">
                  <FaUpload className="mx-auto text-2xl mb-2" />
                  <p className="text-sm font-medium">Upload Docs</p>
                </div>
              </Link>
              <Link to="/student/notifications" className="block">
                <div className="bg-gradient-to-br from-yellow-600 to-yellow-800 p-4 rounded-xl text-center hover:scale-105 transition-transform">
                  <FaBell className="mx-auto text-2xl mb-2" />
                  <p className="text-sm font-medium">Alerts</p>
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

export default StudentDashboard;
