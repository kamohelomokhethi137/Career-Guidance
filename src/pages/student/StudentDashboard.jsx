import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaFileAlt, FaCheckCircle, FaBell, FaClock, FaCalendar, FaSpinner } from "react-icons/fa";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import StudentSidebar from "../../components/student/Sidebar";
import StudentTopNav from "../../components/student/TopNav";

const StatCard = ({ stat }) => {
  const Icon = stat.icon;
  return (
    <Link to={stat.link}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="bg-gray-900 rounded-xl p-6 border border-gray-800 cursor-pointer hover:border-gray-700"
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
      <div className={`p-2 rounded-lg ${item.bg}`}>
        <Icon className={`text-sm ${item.color}`} />
      </div>
      <div className="flex-1">
        <p className="text-sm text-white">{item.message}</p>
        <p className="text-xs text-gray-500">{item.time}</p>
      </div>
    </div>
  );
};

const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [uid, setUid] = useState(null);
  const [stats, setStats] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load user
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (storedUser) {
      setUser(storedUser);
      setUid(localStorage.getItem("uid"));
    }
  }, []);

  // Load student applications from new collection
  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    const appsQuery = query(
      collection(db, "studentApplications"),
      where("studentId", "==", uid)
    );

    const unsubscribe = onSnapshot(appsQuery, (snapshot) => {
      const applications = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      
      const total = applications.length;
      const approved = applications.filter(app => app.status === 'approved').length;
      const rejected = applications.filter(app => app.status === 'rejected').length;
      const pending = applications.filter(app => app.status === 'pending').length;

      setStats([
        { 
          label: "Applications", 
          value: total, 
          icon: FaFileAlt, 
          color: "text-blue-400", 
          bg: "bg-blue-900", 
          link: "/student/university-applications" 
        },
        { 
          label: "Approved", 
          value: approved, 
          icon: FaCheckCircle, 
          color: "text-green-400", 
          bg: "bg-green-900", 
          link: "/student/admissions" 
        },
        { 
          label: "Pending", 
          value: pending, 
          icon: FaClock, 
          color: "text-yellow-400", 
          bg: "bg-yellow-900", 
          link: "/student/university-applications" 
        },
        { 
          label: "Rejected", 
          value: rejected, 
          icon: FaBell, 
          color: "text-red-400", 
          bg: "bg-red-900", 
          link: "/student/admissions" 
        },
      ]);

      // Recent activity
      const activity = applications
        .sort((a, b) => b.appliedAt?.toDate?.() - a.appliedAt?.toDate?.())
        .slice(0, 3)
        .map(app => {
          let message = "";
          let color = "text-blue-400";
          let bg = "bg-blue-900";

          if (app.status === 'approved') {
            message = `Approved for ${app.programTitle}`;
            color = "text-green-400";
            bg = "bg-green-900";
          } else if (app.status === 'rejected') {
            message = `Rejected for ${app.programTitle}`;
            color = "text-red-400";
            bg = "bg-red-900";
          } else {
            message = `Applied to ${app.programTitle}`;
            color = "text-yellow-400";
            bg = "bg-yellow-900";
          }

          return {
            id: app.id,
            message: message,
            time: formatTime(app.appliedAt?.toDate?.() || new Date()),
            icon: FaCheckCircle,
            color: color,
            bg: bg
          };
        });

      setRecentActivity(activity);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [uid]);

  const formatTime = (date) => {
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(diff / 3600000);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
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
    <div className="bg-black min-h-screen text-white flex">
      <StudentSidebar />
      <div className="flex-1 md:ml-64">
        <StudentTopNav studentName={user.fullName || "Student"} />
        
        <main className="pt-20 p-6 space-y-6">
          {/* Welcome */}
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome, {user.fullName || "Student"}!</h1>
            <p className="text-gray-400">Track your university applications and admissions</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                  No applications yet
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;