import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaUsers,
  FaFileAlt,
  FaCheckCircle,
  FaClock,
  FaCalendar,
  FaBuilding,
  FaBookOpen,
  FaTimesCircle,
  FaPaperPlane,
  FaSpinner,
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
  orderBy,
  limit,
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

const DeadlineItem = ({ deadline }) => (
  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-900 border border-gray-800">
    <div>
      <p className="text-sm font-medium text-white">{deadline.title}</p>
      <p className="text-xs text-gray-400">
        Due: {new Date(deadline.date).toLocaleDateString()}
      </p>
    </div>
    <div className="text-right">
      <p
        className={`text-sm font-bold ${
          deadline.daysLeft <= 3 ? "text-red-400" : "text-yellow-400"
        }`}
      >
        {deadline.daysLeft} days left
      </p>
    </div>
  </div>
);

const InstituteDashboard = () => {
  const [stats, setStats] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
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

    // Real-time applications listener
    const appsQuery = query(
      collection(db, "applications"),
      where("institute", "==", storedId)
    );

    const unsubscribeApps = onSnapshot(appsQuery, (snapshot) => {
      try {
        const apps = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        
        const total = apps.length;
        const approved = apps.filter((a) => a.status === "approved").length;
        const admitted = apps.filter((a) => a.status === "admitted").length;
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
            link: "/institute/applications?filter=approved",
          },
          {
            label: "Admitted",
            value: admitted,
            icon: FaUsers,
            color: "text-purple-400",
            bg: "bg-purple-900",
            link: "/institute/admissions",
          },
          {
            label: "Pending Review",
            value: pending,
            icon: FaClock,
            color: "text-yellow-400",
            bg: "bg-yellow-900",
            link: "/institute/applications?filter=pending",
          },
        ]);

        // Generate recent activity from applications
        const recentApps = apps
          .sort((a, b) => (b.appliedAt?.toDate?.() || 0) - (a.appliedAt?.toDate?.() || 0))
          .slice(0, 5);

        const activity = recentApps.map((app, index) => {
          let message = "";
          let icon = FaPaperPlane;
          let color = "text-blue-400";

          if (app.status === 'approved') {
            message = `Application approved for ${app.courseName || 'course'}`;
            icon = FaCheckCircle;
            color = "text-green-400";
          } else if (app.status === 'admitted') {
            message = `Student admitted to ${app.courseName || 'course'}`;
            icon = FaUsers;
            color = "text-purple-400";
          } else if (app.status === 'rejected') {
            message = `Application rejected for ${app.courseName || 'course'}`;
            icon = FaTimesCircle;
            color = "text-red-400";
          } else {
            message = `New application received for ${app.courseName || 'course'}`;
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
        setLoading(false);
      } catch (error) {
        console.error("Error processing applications:", error);
        toast.error("Failed to load applications data.");
        setLoading(false);
      }
    }, (error) => {
      console.error("Firestore error:", error);
      toast.error("Failed to load applications.");
      setLoading(false);
    });

    // Load courses count
    const coursesQuery = query(
      collection(db, "courses"),
      where("instituteId", "==", storedId)
    );

    const unsubscribeCourses = onSnapshot(coursesQuery, (snapshot) => {
      const coursesCount = snapshot.size;
      
      // Update stats with courses count
      setStats(prev => {
        const filtered = prev.filter(stat => stat.label !== "Courses");
        return [
          ...filtered,
          {
            label: "Courses",
            value: coursesCount,
            icon: FaBookOpen,
            color: "text-indigo-400",
            bg: "bg-indigo-900",
            link: "/institute/courses",
          }
        ];
      });
    });

    // Mock deadlines (you can replace this with real deadlines from your database)
    const mockDeadlines = [
      {
        id: 1,
        title: "Application Period Ends",
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        daysLeft: 7
      },
      {
        id: 2,
        title: "Admission Decisions Due",
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        daysLeft: 14
      },
      {
        id: 3,
        title: "Semester Starts",
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        daysLeft: 30
      }
    ];
    setUpcomingDeadlines(mockDeadlines);

    return () => {
      unsubscribeApps();
      unsubscribeCourses();
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
              Manage applications, publish results, and track your institution's progress.
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