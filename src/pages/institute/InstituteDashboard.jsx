import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaUsers,
  FaFileAlt,
  FaCheckCircle,
  FaClock,
  FaCalendar,
  FaBookOpen,
  FaTimesCircle,
  FaPaperPlane,
  FaSpinner,
  FaUniversity,
} from "react-icons/fa";
import InstituteSidebar from "../../components/institute/Sidebar";
import InstituteTopNav from "../../components/institute/TopNav";
import { ToastContainer, toast } from "react-toastify";
import { db } from "../../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

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

const InstituteDashboard = () => {
  const [stats, setStats] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [instituteName, setInstituteName] = useState("Institute");
  const [loading, setLoading] = useState(true);
  const [instituteId, setInstituteId] = useState(null);

  useEffect(() => {
    const storedName = localStorage.getItem("instituteName") || "Institute";
    const storedId = localStorage.getItem("uid");
    setInstituteName(storedName);
    setInstituteId(storedId);

    if (!storedId) {
      toast.error("No institute ID found.");
      setLoading(false);
      return;
    }

    // Real-time student applications listener
    const appsQuery = query(
      collection(db, "studentApplications"),
      where("instituteId", "==", storedId)
    );

    const unsubscribeApps = onSnapshot(appsQuery, (snapshot) => {
      try {
        const apps = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        
        const total = apps.length;
        const approved = apps.filter((a) => a.status === "approved").length;
        const pending = apps.filter((a) => a.status === "pending").length;
        const rejected = apps.filter((a) => a.status === "rejected").length;

        setStats([
          {
            label: "Total Applications",
            value: total,
            icon: FaFileAlt,
            color: "text-blue-400",
            bg: "bg-blue-900",
            link: "/institute/applications",
          },
          {
            label: "Approved",
            value: approved,
            icon: FaCheckCircle,
            color: "text-green-400",
            bg: "bg-green-900",
            link: "/institute/applications",
          },
          {
            label: "Pending Review",
            value: pending,
            icon: FaClock,
            color: "text-yellow-400",
            bg: "bg-yellow-900",
            link: "/institute/applications",
          },
          {
            label: "Rejected",
            value: rejected,
            icon: FaTimesCircle,
            color: "text-red-400",
            bg: "bg-red-900",
            link: "/institute/applications",
          },
        ]);

        // Generate recent activity from applications
        const recentApps = apps
          .sort((a, b) => (b.appliedAt?.toDate?.() || 0) - (a.appliedAt?.toDate?.() || 0))
          .slice(0, 5);

        const activity = recentApps.map((app) => {
          let message = "";
          let icon = FaPaperPlane;
          let color = "text-blue-400";

          if (app.status === 'approved') {
            message = `Application approved for ${app.programTitle || 'program'}`;
            icon = FaCheckCircle;
            color = "text-green-400";
          } else if (app.status === 'rejected') {
            message = `Application rejected for ${app.programTitle || 'program'}`;
            icon = FaTimesCircle;
            color = "text-red-400";
          } else {
            message = `New application from ${app.studentName} for ${app.programTitle || 'program'}`;
            icon = FaPaperPlane;
            color = "text-blue-400";
          }

          return {
            id: app.id,
            message: message,
            time: formatTime(app.appliedAt?.toDate?.() || new Date()),
            icon: icon,
            color: color
          };
        });

        setRecentActivity(activity);
      } catch (error) {
        console.error("Error processing applications:", error);
        toast.error("Failed to load applications data.");
      }
    }, (error) => {
      console.error("Firestore error:", error);
      toast.error("Failed to load applications.");
    });

    // Load university applications count (programs published by institute)
    const universityAppsQuery = query(
      collection(db, "universityApplications"),
      where("instituteId", "==", storedId)
    );

    const unsubscribeUniversityApps = onSnapshot(universityAppsQuery, (snapshot) => {
      const programsCount = snapshot.size;
      
      // Update stats with programs count
      setStats(prev => {
        const filtered = prev.filter(stat => stat.label !== "Programs Published");
        return [
          ...filtered,
          {
            label: "Programs Published",
            value: programsCount,
            icon: FaUniversity,
            color: "text-indigo-400",
            bg: "bg-indigo-900",
            link: "/institute/applications",
          }
        ];
      });
      
      setLoading(false);
    });

    return () => {
      unsubscribeApps();
      unsubscribeUniversityApps();
    };
  }, []);

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

  if (loading) {
    return (
      <div className="bg-black min-h-screen text-white flex">
        <InstituteSidebar />
        <div className="flex-1 md:ml-64 flex items-center justify-center">
          <FaSpinner className="animate-spin text-4xl text-blue-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white flex flex-col md:flex-row">
      <InstituteSidebar />

      <div className="flex-1 md:ml-64">
        <InstituteTopNav instituteName={instituteName} />

        <main className="pt-20 px-4 md:px-8 lg:px-12 space-y-8 pb-8">
          {/* Welcome */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Welcome, {instituteName}!
            </h1>
            <p className="text-white/70 text-sm md:text-base">
              Manage student applications and track your institution's programs.
            </p>
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

            {/* Quick Actions */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FaCalendar className="text-gray-400" /> Quick Actions
              </h2>
              <div className="grid grid-cols-1 gap-3">
                <Link to="/institute/applications" className="block">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-4 rounded-xl text-center hover:scale-105 transition-transform">
                    <FaFileAlt className="mx-auto text-2xl mb-2" />
                    <p className="text-sm font-medium">Manage Applications</p>
                  </div>
                </Link>
                <Link to="/institute/manage-applications" className="block">
                  <div className="bg-gradient-to-br from-green-600 to-green-800 p-4 rounded-xl text-center hover:scale-105 transition-transform">
                    <FaUniversity className="mx-auto text-2xl mb-2" />
                    <p className="text-sm font-medium">Publish Programs</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </main>

        <ToastContainer position="bottom-right" theme="dark" />
      </div>
    </div>
  );
};

export default InstituteDashboard;