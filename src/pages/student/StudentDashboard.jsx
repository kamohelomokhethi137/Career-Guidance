import React, { useState, useEffect } from "react";
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
  FaSpinner,
} from "react-icons/fa";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import StudentSidebar from "../../components/student/Sidebar";
import StudentTopNav from "../../components/student/TopNav";
import { ToastContainer } from "react-toastify";

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
  const [user, setUser] = useState(null);
  const [uid, setUid] = useState(null);
  const [stats, setStats] = useState({
    applications: 0,
    approved: 0,
    admitted: 0,
    notifications: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load user
  useEffect(() => {
    const loadUser = () => {
      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      if (storedUser) {
        setUser(storedUser);
        setUid(localStorage.getItem("uid"));
      }
    };

    loadUser();
    window.addEventListener("userUpdated", loadUser);
    return () => window.removeEventListener("userUpdated", loadUser);
  }, []);

  // Load real data from Firestore
  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    // Load applications
    const appsQuery = query(
      collection(db, "applications"),
      where("studentId", "==", uid)
    );

    const unsubscribe = onSnapshot(appsQuery, async (snapshot) => {
      try {
        const applications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Calculate stats
        const totalApplications = applications.length;
        const approvedApplications = applications.filter(app => app.status === 'approved').length;
        const admittedApplications = applications.filter(app => app.status === 'admitted').length;

        // Generate recent activity from applications
        const activity = applications.slice(0, 3).map(app => {
          let message = "";
          let icon = FaCheckCircle;
          let color = "text-green-400";

          if (app.status === 'approved') {
            message = `Application approved for ${app.courseName || 'course'}`;
            color = "text-green-400";
          } else if (app.status === 'admitted') {
            message = `Admitted to ${app.courseName || 'course'}`;
            color = "text-blue-400";
          } else if (app.status === 'rejected') {
            message = `Application rejected for ${app.courseName || 'course'}`;
            color = "text-red-400";
          } else {
            message = `Applied to ${app.courseName || 'course'}`;
            color = "text-yellow-400";
          }

          return {
            id: app.id,
            type: "application",
            message: message,
            time: formatTime(app.appliedAt?.toDate?.() || new Date()),
            icon: FaCheckCircle,
            color: color
          };
        });

        // Generate upcoming deadlines (mock for now - you can extend this with real deadline data)
        const deadlines = applications
          .filter(app => app.status === 'approved' && app.deadline)
          .slice(0, 2)
          .map((app, index) => {
            const deadlineDate = app.deadline?.toDate?.() || new Date(Date.now() + (index + 3) * 24 * 60 * 60 * 1000);
            const daysLeft = Math.ceil((deadlineDate - new Date()) / (24 * 60 * 60 * 1000));
            
            return {
              id: app.id,
              title: `${app.courseName || 'Course'} - Acceptance Deadline`,
              date: deadlineDate.toISOString(),
              daysLeft: daysLeft > 0 ? daysLeft : 0
            };
          });

        // If no real deadlines, show some sample ones
        if (deadlines.length === 0) {
          deadlines.push(
            {
              id: 1,
              title: "Complete Profile Setup",
              date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              daysLeft: 7
            },
            {
              id: 2,
              title: "Upload Required Documents",
              date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
              daysLeft: 14
            }
          );
        }

        setStats({
          applications: totalApplications,
          approved: approvedApplications,
          admitted: admittedApplications,
          notifications: totalApplications // Using applications count as notification count for now
        });

        setRecentActivity(activity);
        setUpcomingDeadlines(deadlines);
        setLoading(false);

      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [uid]);

  // Format time for activity
  const formatTime = (date) => {
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(diff / 3600000);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(diff / 86400000);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // Prepare stats for display
  const displayStats = [
    { 
      label: "Applications", 
      value: stats.applications, 
      icon: FaFileAlt, 
      color: "text-blue-400", 
      bg: "bg-blue-900", 
      link: "/student/applications" 
    },
    { 
      label: "Approved", 
      value: stats.approved, 
      icon: FaCheckCircle, 
      color: "text-green-400", 
      bg: "bg-green-900", 
      link: "/student/admissions" 
    },
    { 
      label: "Admitted", 
      value: stats.admitted, 
      icon: FaCheckCircle, 
      color: "text-purple-400", 
      bg: "bg-purple-900", 
      link: "/student/admissions" 
    },
    { 
      label: "Notifications", 
      value: stats.notifications, 
      icon: FaBell, 
      color: "text-yellow-400", 
      bg: "bg-yellow-900", 
      link: "/student/notifications" 
    },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center bg-gray-900 p-8 rounded-2xl">
          <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
          <a href="/login" className="bg-white text-black px-6 py-3 rounded-lg font-bold">Login</a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-black min-h-screen text-white flex">
        <StudentSidebar />
        <div className="flex-1 md:ml-64 flex items-center justify-center">
          <FaSpinner className="animate-spin text-4xl text-blue-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white flex flex-col md:flex-row">
      <StudentSidebar />

      <div className="flex-1 md:ml-64">
        <StudentTopNav studentName={user.name || "User"} />

        <main className="pt-20 px-4 md:px-8 lg:px-12 space-y-8 pb-8">
          {/* Welcome */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Welcome back, {user.name || "User"}!
              {stats.admitted > 0 && " 🎉"}
            </h1>
            <p className="text-white/70 text-sm md:text-base">
              {stats.admitted > 0 
                ? `Congratulations! You've been admitted to ${stats.admitted} course${stats.admitted > 1 ? 's' : ''}.` 
                : "Here's what's happening with your applications and career journey."}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {displayStats.map((stat, i) => (
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
                {recentActivity.length > 0 ? (
                  recentActivity.map((item) => (
                    <ActivityItem key={item.id} item={item} />
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No recent activity
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FaCalendar className="text-gray-400" /> Upcoming Deadlines
              </h2>
              <div className="space-y-2">
                {upcomingDeadlines.length > 0 ? (
                  upcomingDeadlines.map((d) => (
                    <DeadlineItem key={d.id} deadline={d} />
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No upcoming deadlines
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link to="/student/courses" className="block">
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-4 rounded-xl text-center hover:scale-105 transition-transform">
                  <FaFileAlt className="mx-auto text-2xl mb-2" />
                  <p className="text-sm font-medium">Browse Courses</p>
                </div>
              </Link>
              <Link to="/student/applications" className="block">
                <div className="bg-gradient-to-br from-green-600 to-green-800 p-4 rounded-xl text-center hover:scale-105 transition-transform">
                  <FaCheckCircle className="mx-auto text-2xl mb-2" />
                  <p className="text-sm font-medium">My Applications</p>
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
                  <p className="text-sm font-medium">Notifications</p>
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