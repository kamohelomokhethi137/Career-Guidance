import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBell, FaGraduationCap, FaBriefcase, FaTrash, FaFilter } from "react-icons/fa";
import { ToastContainer } from "react-toastify";
import { collection, query, onSnapshot, orderBy, where } from "firebase/firestore";
import { db } from "../../firebase";
import StudentSidebar from "../../components/student/Sidebar";
import StudentTopNav from "../../components/student/TopNav";

// Notification config
const NOTIFICATION_TYPES = {
  admission: { icon: FaGraduationCap, color: "text-blue-400", bgColor: "bg-blue-900" },
  job: { icon: FaBriefcase, color: "text-green-400", bgColor: "bg-green-900" },
  system: { icon: FaBell, color: "text-purple-400", bgColor: "bg-purple-900" },
};

// Helper functions
const formatTime = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
};

// Components
const FilterButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
      active ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
    }`}
  >
    {children}
  </button>
);

const NotificationItem = ({ n, onDelete }) => {
  const { icon: Icon, color, bgColor } = NOTIFICATION_TYPES[n.type] || NOTIFICATION_TYPES.system;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`p-4 rounded-xl border transition-all ${
        !n.read ? "bg-gray-900 border-blue-500" : "bg-gray-800 border-gray-700"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${bgColor}`}>
          <Icon className={`text-lg ${color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between mb-1">
            <h3 className={`font-semibold ${!n.read ? "text-white" : "text-gray-300"}`}>
              {n.title}
            </h3>
            <button onClick={() => onDelete(n.id)} className="text-gray-400 hover:text-red-400">
              <FaTrash className="text-sm" />
            </button>
          </div>
          <p className="text-sm text-gray-400 mb-1">{n.message}</p>
          <div className="text-xs text-gray-500">{formatTime(n.time)}</div>
        </div>
      </div>
    </motion.div>
  );
};

export default function Notifications() {
  const [user, setUser] = useState(null);
  const [uid, setUid] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");

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

  // Load application notifications
  useEffect(() => {
    if (!uid) return;

    const appsQuery = query(
      collection(db, "applications"),
      where("studentId", "==", uid),
      orderBy("appliedAt", "desc")
    );

    return onSnapshot(appsQuery, (snap) => {
      const appNotifications = snap.docs.map(doc => {
        const app = doc.data();
        
        // Short status display
        const status = app.status === 'approved' ? 'Approved' : 
                      app.status === 'rejected' ? 'Rejected' : 'Applied';
        
        return {
          id: doc.id,
          type: "admission",
          title: `${status}: ${app.courseName || "Course"}`,
          message: `Your application is ${app.status}.`,
          time: app.appliedAt?.toDate?.() || new Date(),
          read: false,
        };
      });

      setNotifications(appNotifications);
    });
  }, [uid]);

  // Filter notifications
  const filtered = filter === "all" 
    ? notifications 
    : notifications.filter(n => filter === "admission" ? n.type === "admission" : !n.read);

  const unreadCount = notifications.filter(n => !n.read).length;

  const deleteNotif = (id) => setNotifications(prev => prev.filter(n => n.id !== id));
  const clearAll = () => setNotifications([]);
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

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

  return (
    <div className="bg-black min-h-screen text-white flex">
      <StudentSidebar />
      <div className="flex-1 md:ml-64">
        <StudentTopNav studentName={user.name || "Student"} />

        <main className="p-4 md:p-6 max-w-4xl mx-auto space-y-4 mt-16">
          {/* Header */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold">Notifications</h1>
                <p className="text-gray-400 text-sm">Application updates</p>
              </div>
              {unreadCount > 0 && (
                <div className="flex gap-2 items-center">
                  <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                    {unreadCount} unread
                  </span>
                  <button onClick={markAllRead} className="text-blue-400 hover:text-blue-300 text-sm">
                    Mark all read
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-3 flex items-center gap-2">
            <FaFilter className="text-gray-400" />
            {["all", "unread", "admission"].map(f => (
              <FilterButton key={f} active={filter === f} onClick={() => setFilter(f)}>
                {f === "all" ? "All" : f === "unread" ? `Unread (${unreadCount})` : "Admissions"}
              </FilterButton>
            ))}
          </div>

          {/* Notifications */}
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.length > 0 ? (
                filtered.map(n => (
                  <NotificationItem key={n.id} n={n} onDelete={deleteNotif} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No {filter === "all" ? "" : filter} notifications
                </div>
              )}
            </AnimatePresence>
          </div>
        </main>

        <ToastContainer position="bottom-right" theme="dark" />
      </div>
    </div>
  );
}